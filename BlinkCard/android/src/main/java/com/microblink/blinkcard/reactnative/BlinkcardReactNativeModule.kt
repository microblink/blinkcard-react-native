package com.microblink.blinkcard.reactnative

import android.app.Activity
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.microblink.blinkcard.core.BlinkCardSdk
import com.microblink.blinkcard.core.image.InputImage
import com.microblink.blinkcard.core.ping.PingManager
import com.microblink.blinkcard.core.ping.pinglets.WrapperProductInfo
import com.microblink.blinkcard.core.session.BlinkCardProcessResult
import com.microblink.blinkcard.reactnative.serialization.BlinkCardDeserializationUtils
import com.microblink.blinkcard.reactnative.serialization.BlinkCardSerializationUtils
import com.microblink.blinkcard.ux.contract.BlinkCardScanActivitySettings
import com.microblink.blinkcard.ux.contract.MbBlinkCardScan
import com.microblink.blinkcard.ux.contract.ScanActivityResultStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import kotlin.time.Duration.Companion.milliseconds

class BlinkCardReactNativeModule(
  reactContext: ReactApplicationContext
) : NativeBlinkCardReactNativeSpec(reactContext) {

  private val BLINKCARD_REQUEST_CODE = 1454
  private val BLINKCARD_ERROR_RESULT_CODE = "BlinkCardAndroidError"
  private var blinkCardSdk: BlinkCardSdk? = null
  private var pendingPromise: Promise? = null

  override fun getName(): String = NAME

  override fun loadSdk(
    blinkCardSdkSettings: String?,
    promise: Promise?
  ) {
    pendingPromise = promise
    CoroutineScope(Dispatchers.Main).launch {
      try {
        ensureLoadedSdk(blinkCardSdkSettings)
        pendingPromise?.resolve("")
      } catch (error: Exception) {
        blinkCardSdk = null
        pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE,error.message)
      }
    }
  }

  override fun unloadSdk(
    deleteCachedResources: Boolean,
    promise: Promise?
  ) {
      pendingPromise = promise
    try {
      if (deleteCachedResources) {
        BlinkCardSdk.sdkInstance?.closeAndDeleteCachedAssets()
      } else {
        BlinkCardSdk.sdkInstance?.close()
      }
      blinkCardSdk = null
      pendingPromise?.resolve("")
    } catch (error: Exception) {
      blinkCardSdk = null
      pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE,error.message)
    }
  }

  override fun performScan(
    blinkCardSdkSettings: String?,
    blinkCardSessionSettings: String?,
    scanningUxSettings: String?,
    promise: Promise?
  ) {
    pendingPromise = promise
    CoroutineScope(Dispatchers.Main).launch {
      try {
        val blinkCardSessionSettingsJson = blinkCardSessionSettings?.let  { JSONObject(it) }
        val scanningUxSettingsJson = scanningUxSettings?.let  { JSONObject(it) }

        blinkCardSdk = ensureLoadedSdk(blinkCardSdkSettings)

        reactApplicationContext.currentActivity?.let {
          val intent = MbBlinkCardScan().createIntent(
            it,
            BlinkCardScanActivitySettings(
              sdkSettings = BlinkCardDeserializationUtils.deserializeBlinkCardSdkSettings(blinkCardSdkSettings),
              scanningSessionSettings = BlinkCardDeserializationUtils.deserializeBlinkCardSessionSettings(blinkCardSessionSettings),
              uxSettings = BlinkCardDeserializationUtils.deserializeScanningUxSettings(
                stepTimeoutDuration = BlinkCardDeserializationUtils.durationFromTimeoutMillis(
                  blinkCardSessionSettingsJson?.optInt("stepTimeTimeoutInterval", 60000) ?: 60000,
                ),
                inactivityTimeoutDuration = BlinkCardDeserializationUtils.durationFromTimeoutMillis(
                  blinkCardSessionSettingsJson?.optInt("inactivityTimeoutInterval", 10000) ?: 10000,
                ),
                allowHapticFeedback = scanningUxSettingsJson?.optBoolean("allowHapticFeedback", true) ?: true,
                allowScanSound = scanningUxSettingsJson?.optBoolean("allowScanSound", true) ?: true,
              ),
              cameraSettings = BlinkCardDeserializationUtils.deserializeCameraSettings(scanningUxSettingsJson?.get("preferredCameraPosition") as? String ?: "front"),
              showOnboardingDialog = scanningUxSettingsJson?.get("showIntroductionAlert") as? Boolean ?: true,
              showHelpButton = scanningUxSettingsJson?.get("showHelpButton") as? Boolean ?: true,
            )
          )
          addReactNativePinglet(it)
          reactApplicationContext.startActivityForResult(intent, BLINKCARD_REQUEST_CODE, null)
        } ?: run {pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE, BlinkCardReactNativeError.InitializationError("Activity not found").message)}
      } catch (error: Exception) {
        run {
          pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE, error.message)
        }
      }
    }
  }

  override fun performDirectApiScan(
    blinkCardSdkSettings: String?,
    blinkCardSessionSettings: String?,
    firstSideImage: String?,
    secondSideImage: String?,
    promise: Promise?
  ) {
    pendingPromise = promise
    CoroutineScope(Dispatchers.Main).launch {
      try {
        blinkCardSdk = ensureLoadedSdk(blinkCardSdkSettings)

        val context = reactApplicationContext.applicationContext ?: return@launch withContext(
          Dispatchers.Main
        ) {
          promise?.reject(
            BLINKCARD_ERROR_RESULT_CODE,
            BlinkCardReactNativeError.InitializationError("No activity found!").message
          )
        }

        blinkCardSdk?.let {
          addReactNativePinglet(context)
          val session = it.createScanningSession(
            BlinkCardDeserializationUtils.deserializeBlinkCardSessionSettings(
              blinkCardSessionSettings,
              true
            )
          )
          val inputImages = listOfNotNull(
            firstSideImage?.let { image -> BlinkCardDeserializationUtils.base64ToBitmap(image) },
            secondSideImage?.let { image -> BlinkCardDeserializationUtils.base64ToBitmap(image) }
          )
          var result: Result<BlinkCardProcessResult>? = null

          for (image in inputImages) {
            result = session.process(InputImage.createFromBitmap(image))
          }

          if (result?.isSuccess == true) {
            val scanResult = session.getResult()
            val resultJson =
              BlinkCardSerializationUtils.serializeBlinkCardScanningResult(scanResult)
            withContext(Dispatchers.Main) {
              promise?.resolve(resultJson)
            }
          } else {
            withContext(Dispatchers.Main) {
              promise?.reject(BLINKCARD_ERROR_RESULT_CODE, result?.exceptionOrNull()?.message)
            }
          }
          it.close()
          blinkCardSdk = null
        } ?: return@launch withContext(Dispatchers.Main) {
          pendingPromise?.reject(
            BLINKCARD_ERROR_RESULT_CODE,
            BlinkCardReactNativeError.InitializationError("The BlinkCard SDK is not initialized. Call the loadBlinkIdSdk() method to pre-load the SDK first, or try running the performDirectApiScan() method with a valid internet connection.")
          )
        }
      } catch (error: Exception) {
        withContext(Dispatchers.Main) {
          promise?.reject(BLINKCARD_ERROR_RESULT_CODE, error.message)
        }
      }
    }
  }

  init {
    reactApplicationContext.addActivityEventListener(object : BaseActivityEventListener() {

      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
      ) {
        if (requestCode == BLINKCARD_REQUEST_CODE) {
          val blinkCardResult = MbBlinkCardScan().parseResult(resultCode, data)
          when (blinkCardResult.status) {
            ScanActivityResultStatus.Scanned -> {
              blinkCardResult.result?.let { scanningResult ->
                val success = BlinkCardSerializationUtils.serializeBlinkCardScanningResult(
                  scanningResult
                )
                pendingPromise?.resolve(success)
                blinkCardSdk = null
              } ?: pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE, BlinkCardReactNativeError.GenericError("The result is empty.").message)
            }

            ScanActivityResultStatus.Canceled -> {
              pendingPromise?.reject(BLINKCARD_ERROR_RESULT_CODE, BlinkCardReactNativeError.Cancelled())
              blinkCardSdk = null
              suspend {
                BlinkCardSdk.sdkInstance?.close()
              }
            }

            ScanActivityResultStatus.ErrorSdkInit -> {
              pendingPromise?.reject(
                BLINKCARD_ERROR_RESULT_CODE,
                BlinkCardReactNativeError.InitializationError("Could not initialize the SDK.").message
              )
              blinkCardSdk = null
              suspend {
                BlinkCardSdk.sdkInstance?.close()
              }
            }
          }
        }
      }
    })
  }

  private suspend fun ensureLoadedSdk(blinkCardSdkSettingsJson: String?): BlinkCardSdk? {
    blinkCardSdk?.let { return it }

    val sdkSettings = BlinkCardDeserializationUtils.deserializeBlinkCardSdkSettings(blinkCardSdkSettingsJson)
    reactApplicationContext.currentActivity?.let {
      val maybeInstance = BlinkCardSdk.initializeSdk(it, sdkSettings)
      when {
        maybeInstance.isSuccess -> {
          blinkCardSdk = maybeInstance.getOrNull()
          return blinkCardSdk
        }
        maybeInstance.isFailure -> {
          blinkCardSdk = null
          throw maybeInstance.exceptionOrNull() ?: BlinkCardReactNativeError.InitializationError("Could not initialize the SDK")
        }
      }
    }
    return null
  }

  private fun addReactNativePinglet(context: Context) {
    PingManager
      .getInstance(context = context)
      .add(WrapperProductInfo(wrapperProduct = WrapperProductInfo.WrapperProduct.CROSSPLATFORMREACTNATIVE), 0)
  }

  companion object {
    const val NAME = "BlinkCardReactNative"
  }
}


sealed class BlinkCardReactNativeError(message: String): Exception(message) {

  class InvalidLicenseKeyProvided:
    BlinkCardReactNativeError("Invalid license key provided")

  data class InvalidSettingsProvided(val detail: String) :
    BlinkCardReactNativeError("Invalid settings provided: $detail")

  class Cancelled :
    BlinkCardReactNativeError("Scanning has been cancelled")

  data class InitializationError(val detail: String) :
    BlinkCardReactNativeError("Initialization error: $detail")

  data class GenericError(val detail: String) :
    BlinkCardReactNativeError("Error: $detail")
}
