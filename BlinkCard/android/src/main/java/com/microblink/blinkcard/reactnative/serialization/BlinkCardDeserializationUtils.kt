package com.microblink.blinkcard.reactnative.serialization

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import com.microblink.blinkcard.core.BlinkCardSdkSettings
import com.microblink.blinkcard.core.network.RequestTimeout
import com.microblink.blinkcard.core.session.BlinkCardSessionSettings
import com.microblink.blinkcard.core.session.InputImageSource
import com.microblink.blinkcard.core.settings.RedactionMode
import com.microblink.blinkcard.core.settings.RedactionSettings
import com.microblink.blinkcard.core.settings.CardNumberRedactionSettings
import com.microblink.blinkcard.core.settings.CroppedImageSettings
import com.microblink.blinkcard.core.settings.SensitivityLevel
import com.microblink.blinkcard.core.settings.ExtractionSettings
import com.microblink.blinkcard.core.settings.LivenessSettings
import com.microblink.blinkcard.core.settings.ResourcesConfig
import com.microblink.blinkcard.core.settings.ScanningSettings
import com.microblink.blinkcard.core.settings.StrictnessLevel
import com.microblink.blinkcard.reactnative.BlinkCardReactNativeError
import com.microblink.blinkcard.ux.camera.CameraLensFacing
import com.microblink.blinkcard.ux.camera.CameraSettings
import com.microblink.blinkcard.ux.settings.BlinkCardUxSettings
import org.json.JSONArray
import org.json.JSONObject
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds

object BlinkCardDeserializationUtils {
  fun deserializeBlinkCardSdkSettings(blinkCardSdkSettingsJson: String?): BlinkCardSdkSettings {
      if (blinkCardSdkSettingsJson.isNullOrEmpty()) throw BlinkCardReactNativeError.InvalidSettingsProvided("SDK settings")
    val blinkCardSdkSettingsJson = JSONObject(blinkCardSdkSettingsJson).toMap()

    val licenseKey = blinkCardSdkSettingsJson["licenseKey"] as? String ?: throw BlinkCardReactNativeError.InvalidLicenseKeyProvided()
    return BlinkCardSdkSettings(
      licenseKey = licenseKey,
      licensee = blinkCardSdkSettingsJson["licensee"] as? String,
      downloadResources = blinkCardSdkSettingsJson["downloadResources"] as? Boolean ?: true,
      resourceDownloadUrl = blinkCardSdkSettingsJson["resourceDownloadUrl"] as? String ?: ResourcesConfig.defaultResourceDownloadUrl,
      resourceLocalFolder = blinkCardSdkSettingsJson["resourceLocalFolder"] as? String ?: ResourcesConfig.defaultResourcesLocalFolder,
      resourceRequestTimeout = deserializeResourceRequestTimeout(
        blinkCardSdkSettingsJson["resourceRequestTimeout"],
      ),
      microblinkProxyUrl = blinkCardSdkSettingsJson["microblinkProxyURL"] as? String
    )
  }

  private fun deserializeResourceRequestTimeout(value: Any?): RequestTimeout {
    val timeoutMs = (value as? Number)?.toLong() ?: return RequestTimeout.DEFAULT
    val timeout = timeoutMs.milliseconds
    return RequestTimeout(
      connectionTimeout = timeout,
      readTimeout = timeout,
      writeTimeout = timeout,
    )
  }

  private fun Any?.toFloatFromChannel(default: Float): Float =
    (this as? Number)?.toFloat() ?: default

  private fun Any?.toUShortFromChannel(default: UShort): UShort =
    (this as? Number)?.toInt()?.toUShort() ?: default

  fun deserializeBlinkCardSessionSettings(blinkCardSessionSettingsJson: String?, isDirectApi: Boolean = false): BlinkCardSessionSettings {
    val json = blinkCardSessionSettingsJson ?: return BlinkCardSessionSettings()
    val blinkCardSessionSettingsJson = JSONObject(json).toMap()

    return BlinkCardSessionSettings(
      inputImageSource = if (isDirectApi) InputImageSource.Photo else InputImageSource.Video,
      scanningSettings =  deserializeScanningSettings(blinkCardSessionSettingsJson["scanningSettings"] as? Map<*, *>),

      )
  }
  fun deserializeScanningSettings(scanningSettingsJson: Map<*, *>?): ScanningSettings {
    val scanningSettingsJson = scanningSettingsJson ?: return ScanningSettings()
    val settings = ScanningSettings(
      skipImagesWithBlur = scanningSettingsJson["skipImagesWithBlur"] as? Boolean ?: true,
      tiltSensitivityLevel = deserializeSensitivityLevel(scanningSettingsJson["tiltSensitivityLevel"] as? String ?: "mid"),
      inputImageMargin = scanningSettingsJson["inputImageMargin"].toFloatFromChannel(0.02f),
      livenessSettings = deserializeLivenessSettings(scanningSettingsJson["livenessSettings"] as? Map<*, *>),
      extractionSettings = deserializeExtractionSettings(scanningSettingsJson["extractionSettings"] as? Map<*, *>),
      croppedImageSettings = deserializeCroppedImageSettings(scanningSettingsJson["croppedImageSettings"] as? Map<*, *>),
    )
    val redactionSettingsJson = scanningSettingsJson["redactionSettings"] as? Map<*, *>
    return if (redactionSettingsJson.isNullOrEmpty()) {
      settings
    } else {
      settings.copy(redactionSettings = deserializeRedactionSettings(redactionSettingsJson))
    }
  }

  fun deserializeLivenessSettings(livenessSettingsJson: Map<*, *>?): LivenessSettings {
    val livenessSettingsJson = livenessSettingsJson ?: return LivenessSettings()
    return LivenessSettings(
      enableCardHeldInHandCheck = livenessSettingsJson["enableCardHeldInHandCheck"] as? Boolean ?: true,
      handCardOverlapThreshold = livenessSettingsJson["handCardOverlapThreshold"].toFloatFromChannel(0.05f),
      handToCardSizeRatio = livenessSettingsJson["handToCardSizeRatio"].toFloatFromChannel(0.15f),
      photocopyCheckStrictnessLevel = deserializeStrictnessLevel(livenessSettingsJson["photocopyCheckStrictnessLevel"] as? String ?: "level5"),
      screenCheckStrictnessLevel = deserializeStrictnessLevel(livenessSettingsJson["screenCheckStrictnessLevel"] as? String ?: "level5")
    )
  }

  fun deserializeExtractionSettings(extractionSettingsJson: Map<*,*>?): ExtractionSettings {
    val extractionSettingsJson = extractionSettingsJson ?: return ExtractionSettings()
    return ExtractionSettings(
      extractIban = extractionSettingsJson["extractIban"] as? Boolean ?: true,
      extractExpiryDate = extractionSettingsJson["extractExpiryDate"] as? Boolean ?: true,
      extractCardholderName = extractionSettingsJson["extractCardholderName"] as? Boolean
        ?: true,
      extractCvv = extractionSettingsJson["extractCvv"] as? Boolean ?: true,
      extractInvalidCardNumber = extractionSettingsJson["extractInvalidCardNumber"] as? Boolean
        ?: false
    )
  }

  fun deserializeCroppedImageSettings(croppedImageSettingsJson: Map<*, *>?): CroppedImageSettings {
    val croppedImageSettingsJson = croppedImageSettingsJson ?: return CroppedImageSettings()
    return CroppedImageSettings(
      dotsPerInch = croppedImageSettingsJson["dotsPerInch"].toUShortFromChannel(250u),
      extensionFactor = croppedImageSettingsJson["extensionFactor"].toFloatFromChannel(0.0f),
      returnCardImage = croppedImageSettingsJson["returnCardImage"] as? Boolean ?: false,
    )
  }

  fun deserializeRedactionSettings(redactionSettingsJson: Map<*, *>?): RedactionSettings {
    if (redactionSettingsJson.isNullOrEmpty()) return RedactionSettings()
    var settings = RedactionSettings()
    (redactionSettingsJson["cardholderNameRedactionMode"] as? String)?.let { mode ->
      settings = settings.copy(cardholderNameRedactionMode = deserializeRedactionMode(mode))
    }
    (redactionSettingsJson["cvvRedactionMode"] as? String)?.let { mode ->
      settings = settings.copy(cvvRedactionMode = deserializeRedactionMode(mode))
    }
    (redactionSettingsJson["ibanRedactionMode"] as? String)?.let { mode ->
      settings = settings.copy(ibanRedactionMode = deserializeRedactionMode(mode))
    }
    (redactionSettingsJson["cardNumberRedactionSettings"] as? Map<*, *>)?.let { cardNumberJson ->
      settings = settings.copy(
        cardNumberRedactionSettings = deserializeCardNumberRedactionSettings(cardNumberJson),
      )
    }
    return settings
  }

  fun deserializeCardNumberRedactionSettings(cardNumberRedactionSettingsJson: Map<*, *>?): CardNumberRedactionSettings {
    if (cardNumberRedactionSettingsJson.isNullOrEmpty()) return CardNumberRedactionSettings()
    var settings = CardNumberRedactionSettings()
    (cardNumberRedactionSettingsJson["mode"] as? String)?.let { mode ->
      settings = settings.copy(mode = deserializeRedactionMode(mode))
    }
    (cardNumberRedactionSettingsJson["prefixDigitsVisible"] as? Number)?.toInt()?.let { digits ->
      settings = settings.copy(prefixDigitsVisible = digits.toUByte())
    }
    (cardNumberRedactionSettingsJson["suffixDigitsVisible"] as? Number)?.toInt()?.let { digits ->
      settings = settings.copy(suffixDigitsVisible = digits.toUByte())
    }
    return settings
  }

  fun deserializeScanningUxSettings(
    stepTimeoutDuration: Duration,
    inactivityTimeoutDuration: Duration,
    allowHapticFeedback: Boolean,
    allowScanSound: Boolean,
  ): BlinkCardUxSettings {
    return BlinkCardUxSettings(
      stepTimeoutDuration = stepTimeoutDuration,
      inactivityTimeoutDuration = inactivityTimeoutDuration,
      allowHapticFeedback = allowHapticFeedback,
      allowScanSound = allowScanSound,
    )
  }

  fun durationFromTimeoutMillis(timeoutMillis: Int): Duration = timeoutMillis.milliseconds

  fun deserializeSensitivityLevel(level: String): SensitivityLevel = SensitivityLevel.valueOf(level.replaceFirstChar { it.uppercase() })
  fun deserializeStrictnessLevel(level: String): StrictnessLevel = StrictnessLevel.valueOf(level.replaceFirstChar { it.uppercase() })
  fun deserializeRedactionMode(mode: String): RedactionMode = RedactionMode.valueOf(mode.replaceFirstChar { it.uppercase() })

  fun deserializeCameraSettings(lens: String): CameraSettings  {
    val cameraLens = if (lens == "front") CameraLensFacing.LensFacingFront else CameraLensFacing.LensFacingBack
    return CameraSettings(lensFacing = cameraLens)
  }

  fun base64ToBitmap(base64Str: String?): Bitmap? {
    return try {
      val decodedBytes = Base64.decode(base64Str, Base64.DEFAULT)
      BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
    } catch (_: IllegalArgumentException) {
      null
    }
  }
}

fun JSONObject.toMap(): Map<String, Any?> {
  val map = mutableMapOf<String, Any?>()

  keys().forEach { key ->
    val value = get(key)
    map[key] = when (value) {
      is JSONArray -> value.toList()
      is JSONObject -> value.toMap()
      JSONObject.NULL -> null
      else -> value
    }
  }

  return map
}

fun JSONArray.toList(): List<Any?> {
  val list = mutableListOf<Any?>()

  for (i in 0 until length()) {
    val value = get(i)
    list.add(
      when (value) {
        is JSONArray -> value.toList()
        is JSONObject -> value.toMap()
        JSONObject.NULL -> null
        else -> value
      }
    )
  }

  return list
}
