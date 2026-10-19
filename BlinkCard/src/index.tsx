import { BlinkCardScanningResult } from "./blinkCardResult";
import type {
  BlinkCardSdkSettings,
  BlinkCardSessionSettings,
  ScanningUxSettings,
} from "./blinkCardSettings";
import NativeBlinkCardReactNative, {
  type Spec,
} from "./NativeBlinkCardReactNative";

export * from "./blinkCardSettings";
export * from "./blinkCardResult";
export * from "./types";

const BlinkCardReactNative: Spec =
  require("./NativeBlinkCardReactNative").default;

export default BlinkCardReactNative;

/**
 * The `loadSdk` platform channel method creates or retrieves the instance of the BlinkCard SDK.
 *
 * Initializes and loads the BlinkCard SDK if it is not already loaded.
 *
 * This method handles:
 * - SDK initialization
 * - Resource downloading
 * - License verification
 *
 * It ensures that only one SDK instance exists at any time.
 *
 * You can call this method in advance to **preload** the SDK before starting a scanning session.
 * Doing so reduces loading time for the {@link performScan} and {@link performDirectApiScan} methods,
 * since all resources will already be available and the license verified.
 *
 * If you do not call this method beforehand, it will still be automatically invoked on the native platform channels
 * when a scan starts. However, the initial scan may take longer due to resource loading and license checks.
 *
 * @param blinkCardSdkSettings - {@link BlinkCardSdkSettings} the class that contains all of the available SDK settings. It contains settings for the license key, and how the models (that the SDK needs for the scanning process) should be obtained.
 *
 * To obtain a valid license key, please visit https://developer.microblink.com/ or contact us directly at https://help.microblink.com
 */
export async function loadSdk(
  blinkCardSdkSettings: BlinkCardSdkSettings,
): Promise<void> {
  return await NativeBlinkCardReactNative.loadSdk(
    JSON.stringify(blinkCardSdkSettings),
  );
}

/**
 * The `unloadSdk` method terminates the BlinkCard SDK and releases all associated resources.
 *
 * This method safely shuts down the SDK instance and frees any allocated memory.
 * After calling this method, you must reinitialize the SDK by calling {@link loadSdk}
 * or any of the scanning methods) before using it again.
 *
 * @param deleteCachedResources - If set to `true` (`false` is default), the method performs a **complete cleanup**, including deletion of
 * all downloaded and cached SDK resources from the device.
 *
 * This method is automatically called after each successful scan session.
 */
export async function unloadSdk(deleteCachedResources: boolean): Promise<void> {
  return await NativeBlinkCardReactNative.unloadSdk(deleteCachedResources);
}

/**
 * The `performScan` method launches the BlinkCard scanning process with the default UX properties.
 *
 * @param blinkCardSdkSettings - {@link BlinkCardSdkSettings}: the class that contains all of the available SDK settings.
 * It contains settings for the license key, and how the models (that the SDK needs for the scanning process) should be obtained.
 * To obtain a valid license key, please visit https://developer.microblink.com/ or contact us directly at https://help.microblink.com
 *
 * @param blinkCardSessionSettings - {@link BlinkCardSessionSettings}: the class that contains specific scanning configurations that
 * define how the scanning session should behave.
 *
 * @param scanningUxSettings - {@link ScanningUxSettings} - the class that allows customization of various aspects of the UI & UX
 * used during the scanning process.
 *
 * @returns BlinkCardScanningResult | undefined
 */
export async function performScan(
  blinkCardSdkSettings: BlinkCardSdkSettings,
  blinkCardSessionSettings: BlinkCardSessionSettings,
  scanningUxSettings: ScanningUxSettings,
): Promise<BlinkCardScanningResult | undefined> {
  const blinkCardJsonResult = await NativeBlinkCardReactNative.performScan(
    JSON.stringify(blinkCardSdkSettings),
    JSON.stringify(blinkCardSessionSettings),
    JSON.stringify(scanningUxSettings),
  );
  if (blinkCardJsonResult === undefined) return undefined;
  return new BlinkCardScanningResult(JSON.parse(blinkCardJsonResult));
}

/**
 * The `performDirectApiScan` method launches the BlinkCard scanning process intended for information extraction from static images.
 *
 * @param blinkCardSdkSettings - {@link BlinkCardSdkSettings}: the class that contains all of the available SDK settings.
 * It contains settings for the license key, and how the models (that the SDK needs for the scanning process) should be obtained.
 * To obtain a valid license key, please visit https://developer.microblink.com/ or contact us directly at https://help.microblink.com
 *
 * @param blinkCardSessionSettings - {@link BlinkCardSessionSettings}: the class that contains specific scanning configurations
 * that define how the scanning session should behave.
 *
 * @param firstSideImage - Base64 string: image that represents one side of the card.
 * **Should be the image where the card number is located.**
 *
 * @param secondSideImage - Base64 string: needed if the information from other side of the document is required
 * and not all information from the first side of the card.
 *
 * @returns BlinkCardScanningResult | undefined
 */
export async function performDirectApiScan(
  blinkCardSdkSettings: BlinkCardSdkSettings,
  blinkCardSessionSettings: BlinkCardSessionSettings,
  firstSideImage: string,
  secondSideImage?: string,
): Promise<BlinkCardScanningResult | undefined> {
  const blinkCardJsonResult =
    await NativeBlinkCardReactNative.performDirectApiScan(
      JSON.stringify(blinkCardSdkSettings),
      JSON.stringify(blinkCardSessionSettings),
      JSON.stringify(firstSideImage),
      JSON.stringify(secondSideImage),
    );

  if (blinkCardJsonResult === undefined) return undefined;
  return new BlinkCardScanningResult(JSON.parse(blinkCardJsonResult));
}
