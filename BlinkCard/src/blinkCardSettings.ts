import {
  RedactionMode,
  CameraPosition,
  CardNumberRedactionSettings,
  SensitivityLevel,
  StrictnessLevel,
} from "./types";

/**
 * Settings for initialization of the BlinkCard SDK.
 */
export class BlinkCardSdkSettings {
  /**
   * License key for the native SDK
   */
  licenseKey: string;

  /**
   * Optional licensee string if the provided license key
   *  is not tied to the single application ID
   */
  licensee?: string;
  /**
   * Whether resources required for on-device image processing should be downloaded and cached
   * on first initialization of the SDK.
   * If set to false, you need to package all the required
   * resources in your application's assets.
   */
  downloadResources?: boolean;
  /**
   * If resources are to be downloaded, the following is the URL where the resources are hosted.
   * URL: `"https://models.cdn.microblink.com/resources"`
   */
  resourceDownloadUrl?: string;
  /**
   * Local folder name where resources will be downloaded and cached.
   * If resources are being downloaded, this defines the name of the folder within your
   * application's cache folder where resources will be cached.
   */
  resourceLocalFolder?: string;
  /**
   * [iOS-specific] If resources downloading is disabled for iOS, this defines the bundle identifier of your iOS app where the resources reside.
   */
  bundleIdentifier?: string;
  /**
   * Resource download timeout in milliseconds
   * When omitted, the native SDK default applies (30 seconds).
   */
  resourceRequestTimeout?: number;
  /**
   * Set a custom HTTPS URL to be used as a proxy for Ping and license checks.
   * The proxy URL will be applied only if the license has the appropriate rights.
   * The URL must use the HTTPS protocol. Example: https://your-proxy.com/
   *
   * If this value is defined, SDK initialization will not be successful in the following cases:
   *   - if the URL does not use HTTPS or if the URL is invalid
   *   - if the license does not allow proxy usage
   */
  microblinkProxyURL?: string;

  constructor({
    licenseKey,
    licensee,
    downloadResources = true,
    resourceDownloadUrl,
    resourceLocalFolder,
    bundleIdentifier,
    resourceRequestTimeout,
    microblinkProxyURL,
  }: {
    licenseKey: string;
    licensee?: string;
    downloadResources?: boolean;
    resourceDownloadUrl?: string;
    resourceLocalFolder?: string;
    bundleIdentifier?: string;
    resourceRequestTimeout?: number;
    microblinkProxyURL?: string;
  }) {
    this.licenseKey = licenseKey;
    this.licensee = licensee;
    this.downloadResources = downloadResources;
    this.resourceDownloadUrl = resourceDownloadUrl;
    this.resourceLocalFolder = resourceLocalFolder;
    this.bundleIdentifier = bundleIdentifier;
    this.resourceRequestTimeout = resourceRequestTimeout;
    this.microblinkProxyURL = microblinkProxyURL;
  }
}
/**
 * Represents the configuration settings for a scanning session.
 *
 * This class holds the settings related to the input image source and specific scanning configurations
 * that define how the scanning session should behave.
 */
export class BlinkCardSessionSettings {
  /**
   * The specific scanning settings for the scanning session.
   * Defines various parameters that control the scanning process.
   */
  scanningSettings: ScanningSettings;

  /**
   * Duration in milliseconds before a scanning step times out and is cancelled.
   *
   * Passed through to the native SDK. Negative values do not disable the step timeout.
   * Default: `60000` (60 seconds).
   */
  stepTimeTimeoutInterval: number;

  /**
   * Duration in milliseconds with no scanning progress before an inactivity timeout.
   *
   * Set to `0` to disable the inactivity timeout.
   * Default: `10000` (10 seconds).
   */
  inactivityTimeoutInterval: number;

  constructor({
    scanningSettings = new ScanningSettings(),
    stepTimeTimeoutInterval = 60000,
    inactivityTimeoutInterval = 10000,
  }: {
    scanningSettings?: ScanningSettings;
    stepTimeTimeoutInterval?: number;
    inactivityTimeoutInterval?: number;
  } = {}) {
    this.scanningSettings = scanningSettings;
    this.stepTimeTimeoutInterval = stepTimeTimeoutInterval;
    this.inactivityTimeoutInterval = inactivityTimeoutInterval;
  }
}

/**
 * Represents the configurable settings for scanning a card.
 *
 * This class defines various parameters and policies related to the scanning process,
 * including image quality handling, data extraction, redaction, and liveness detection,
 * along with options for frame processing and image extraction.
 */
export class ScanningSettings {
  /**
   * Indicates whether to reject frames if blur is detected on the card image.
   *
   * When `true` (default), frames with detected blur are skipped to ensure only high-quality images are processed.
   * When `false`, blurred frames are still processed, and the blur status is reported in the ProcessResult.
   *
   * Default: `true`.
   */
  skipImagesWithBlur: boolean;

  /**
   * The level of allowed detected tilt of the card in the image.
   *
   * Defines the severity of allowed detected tilt of the card in the image, as defined in {@link SensitivityLevel}.
   *
   * Values range from `off` (detection turned off) to higher levels of allowed tilt.
   *
   * Defaults to `SensitivityLevel.mid`.
   */
  tiltSensitivityLevel: SensitivityLevel;

  /**
   * Defines the minimum required margin (in percentage) between the edge of the input image and the card. Default value is 0.02 (also recommended value).
   *
   * The setting is applicable only when using images from Video source.
   *
   * Default: `0.02`.
   */
  inputImageMargin: number;

  /**
   * Represents the configurable settings for liveness detection.
   *
   * This defines various parameters and policies related to the liveness detection process,
   * including checks for hand presence and screen analysis.
   */

  livenessSettings: LivenessSettings;

  /**
   * Controls which fields and images should be extracted from the card.
   *
   * Disabling extraction of unused fields can improve recognition performance or reduce memory usage.
   */
  extractionSettings: ExtractionSettings;

  /**
   * Configures the image cropping settings during scanning process.
   *
   * Allows customization of cropped image handling, such as dotsPerInch, extensionFactor,
   * and whether images should be returned for the entire card.
   */
  croppedImageSettings: CroppedImageSettings;

  /**
   * Redaction settings for sensitive card data.
   *
   * When omitted, the native SDK default redaction policy applies (PAN and CVV
   * redacted with four prefix and four suffix digits visible on the card number; IBAN and
   * cardholder name not redacted).
   */
  redactionSettings?: RedactionSettings;

  constructor({
    skipImagesWithBlur = true,
    tiltSensitivityLevel = SensitivityLevel.Mid,
    inputImageMargin = 0.02,
    livenessSettings = new LivenessSettings(),
    extractionSettings = new ExtractionSettings(),
    croppedImageSettings = new CroppedImageSettings(),
    redactionSettings,
  }: {
    skipImagesWithBlur?: boolean;
    tiltSensitivityLevel?: SensitivityLevel;
    inputImageMargin?: number;
    livenessSettings?: LivenessSettings;
    extractionSettings?: ExtractionSettings;
    croppedImageSettings?: CroppedImageSettings;
    redactionSettings?: RedactionSettings;
  } = {}) {
    this.skipImagesWithBlur = skipImagesWithBlur;
    this.tiltSensitivityLevel = tiltSensitivityLevel;
    this.inputImageMargin = inputImageMargin;
    this.livenessSettings = livenessSettings;
    this.extractionSettings = extractionSettings;
    this.croppedImageSettings = croppedImageSettings;
    this.redactionSettings = redactionSettings;
  }
}

/**
 * Configuration settings for liveness detection during card scanning.
 *
 * This class defines various parameters that control the behavior of liveness detection, including
 * thresholds for hand detection, screen and photocopy analysis,
 * and options to skip processing certain frames based on liveness criteria.
 *
 */
export class LivenessSettings {
  /**
   * Enables or disables the check for card held in hand.
   *
   * When true, the liveness detection will include a check to verify that the card is being held in hand.
   *
   * Default: `true`
   */
  enableCardHeldInHandCheck: boolean;
  /**
   * Minimum overlap threshold between detected hand and card regions.
   *
   * This parameter is used to adjust heuristics that eliminate cases when the hand is present in the input but it is not holding the card.
   *
   * `handCardOverlapThreshold` is the minimal ratio of hand pixels inside the frame surrounding the card and area of that frame.
   * Only pixels inside that frame are used to ignore false-positive hand segmentations inside the card.
   *
   * Value must be in range \[0.0, 1.0\].
   *
   * Default: `0.05`.
   */
  handCardOverlapThreshold: number;

  /**
   * Minimum hand-to-card size ratio for valid hand detection.
   *
   * This controls how large a hand must appear in the frame relative to the card to be considered valid.
   * Lower values detect smaller/more distant hands.
   * Hand scale is calculated as a ratio between area of hand mask and card mask.
   *
   * Value must be in range \[0.0, 1.0\].
   *
   * Default: `0.15`
   */
  handToCardSizeRatio: number;
  /**
   * Sensitivity level for detecting frames where the presented card is a photocopy.
   *
   * Higher levels provide better security by being more strict in detecting photocopied cards, but may increase false positives.
   *
   * Default: `StrictnessLevel.level5`.
   */
  photocopyCheckStrictnessLevel: StrictnessLevel;
  /**
   * Sensitivity level for detecting frames where the card is displayed on a screen.
   *
   * Higher levels provide better security by being more strict in detecting screen-displayed cards, but may increase false positives.
   *
   * Default: `StrictnessLevel.level5`.
   */
  screenCheckStrictnessLevel: StrictnessLevel;

  constructor({
    enableCardHeldInHandCheck = true,
    handCardOverlapThreshold = 0.05,
    handToCardSizeRatio = 0.15,
    screenCheckStrictnessLevel = StrictnessLevel.Level5,
    photocopyCheckStrictnessLevel = StrictnessLevel.Level5,
  }: {
    enableCardHeldInHandCheck?: boolean;
    handCardOverlapThreshold?: number;
    handToCardSizeRatio?: number;
    photocopyCheckStrictnessLevel?: StrictnessLevel;
    screenCheckStrictnessLevel?: StrictnessLevel;
  } = {}) {
    this.enableCardHeldInHandCheck = enableCardHeldInHandCheck;
    this.handCardOverlapThreshold = handCardOverlapThreshold;
    this.handToCardSizeRatio = handToCardSizeRatio;
    this.screenCheckStrictnessLevel = screenCheckStrictnessLevel;
    this.photocopyCheckStrictnessLevel = photocopyCheckStrictnessLevel;
  }
}
/**
 * Controls which fields and images should be extracted from the payment card.
 *
 * Disabling extraction of unused fields can improve recognition performance or reduce memory usage.
 */
export class ExtractionSettings {
  /**
   * Whether to extract the IBAN (International Bank Account Number).
   * Default: `true`
   */
  extractIban: boolean;

  /**
   * Whether to extract the card expiry date.
   * Default: `true`
   */
  extractExpiryDate: boolean;
  /**
   * Whether to extract the cardholder name.
   *
   * Default: `true`.
   */
  extractCardholderName: boolean;
  /**
   * Whether to extract the CVV (Card Verification Value) security code.
   *
   * Usually found on the back of the card.
   * Required for secure transactions.
   *
   * Default: `true`
   */
  extractCvv: boolean;
  /**
   * Indicates whether card numbers that fail checksum validation should be accepted.
   *
   * Card numbers are validated using the Luhn algorithm.
   *
   * A value of false (default) means only card numbers that pass the checksum validation will be accepted.
   * A value of true means card numbers that fail checksum validation will still be accepted.
   *
   * This may be useful for testing purposes or when processing damaged/worn cards.
   * The cardNumberValid field in the result will still indicate whether the checksum passed.
   *
   * Default: `false`
   */
  extractInvalidCardNumber: boolean;

  /**
   * Controls which fields and images should be extracted from the payment card.
   *
   * Disabling extraction of unused fields can improve recognition performance or reduce memory usage.
   */
  constructor({
    extractIban = true,
    extractExpiryDate = true,
    extractCardholderName = true,
    extractCvv = true,
    extractInvalidCardNumber = false,
  }: {
    extractIban?: boolean;
    extractExpiryDate?: boolean;
    extractCardholderName?: boolean;
    extractCvv?: boolean;
    extractInvalidCardNumber?: boolean;
  } = {}) {
    this.extractIban = extractIban;
    this.extractExpiryDate = extractExpiryDate;
    this.extractCardholderName = extractCardholderName;
    this.extractCvv = extractCvv;
    this.extractInvalidCardNumber = extractInvalidCardNumber;
  }
}
/**
 * Holds the settings which control the redaction of returned data.
 *
 * Assign to {@link ScanningSettings.redactionSettings} to override native SDK defaults.
 * Property defaults below apply only when constructing this object explicitly.
 */
export class RedactionSettings {
  /**
   * Defines the mode of cardholder name redaction.
   */
  cardholderNameRedactionMode: RedactionMode;
  /**
   * Defines the mode of CVV redaction.
   */
  cvvRedactionMode: RedactionMode;
  /**
   * Defines the mode of IBAN redaction.
   */
  ibanRedactionMode: RedactionMode;
  /**
   * Defines the parameters of card number redaction.
   */
  cardNumberRedactionSettings: CardNumberRedactionSettings;

  /**
   * Holds the settings which control the redaction of returned data.
   */
  constructor({
    cardholderNameRedactionMode = RedactionMode.None,
    cvvRedactionMode = RedactionMode.FullResult,
    ibanRedactionMode = RedactionMode.None,
    cardNumberRedactionSettings = new CardNumberRedactionSettings(),
  }: {
    cardholderNameRedactionMode?: RedactionMode;
    cvvRedactionMode?: RedactionMode;
    ibanRedactionMode?: RedactionMode;
    cardNumberRedactionSettings?: CardNumberRedactionSettings;
  } = {}) {
    this.cardholderNameRedactionMode = cardholderNameRedactionMode;
    this.cardNumberRedactionSettings = cardNumberRedactionSettings;
    this.cvvRedactionMode = cvvRedactionMode;
    this.ibanRedactionMode = ibanRedactionMode;
  }
}
/**
 * Represents the image cropping settings.
 *
 * This class controls how card images are cropped, including the resolution,
 * extension of the cropping area, and whether the cropped image should be returned in the results.
 */
export class CroppedImageSettings {
  /**
   * The DPI value for the cropped image.
   *
   * Default: `250`
   */
  dotsPerInch: number;
  /**
   * The extension factor for the cropped card image.
   * Value must be in range \[0.0, 1.0\].
   *
   * Defaults: `0.0`.
   */
  extensionFactor: number;
  /**
   * Indicates whether the cropped card image should be returned.
   *
   * Provides the complete card image for record keeping or further processing.
   * Disable to reduce memory usage if image is not needed.
   *
   * Default: `false`.
   */
  returnCardImage: boolean;

  constructor({
    dotsPerInch = 250,
    extensionFactor = 0,
    returnCardImage = false,
  }: {
    dotsPerInch?: number;
    extensionFactor?: number;
    returnCardImage?: boolean;
  } = {}) {
    this.dotsPerInch = dotsPerInch;
    this.extensionFactor = extensionFactor;
    this.returnCardImage = returnCardImage;
  }
}
/**
 * Allows customization of various aspects of the UI/UX
 * used during the scanning process.
 */
export class ScanningUxSettings {
  /**
   * Determines if alert will be shown when scanning start.
   *
   * Default: `true`
   */
  showIntroductionAlert: boolean;
  /**
   * Determines if help button for raising an onboarding sheet will be shown.
   *
   * Default: `true`
   */
  showHelpButton: boolean;
  /**
   *The preferred camera position to use when capturing document.
   *
   * This value represents the user’s choice of front or back camera.
   * The system determines the actual physical camera device.
   *
   * Default: [CameraPosition.back]
   */
  preferredCameraPosition: CameraPosition;
  /**
   * When enabled, haptic responses are generated during scanning activities,
   *
   * such as detection updates or user interactions (e.g., toggling the flashlight).
   * When disabled, no haptic feedback is produced.
   *
   * Default: `true`
   */
  allowHapticFeedback: boolean;

  /**
   * When enabled, scan sounds are played during scanning activities.
   * When disabled, no scan sounds are played.
   *
   * Default: `true`
   */
  allowScanSound: boolean;

  /**
   * Allows customization of various aspects of the UI/UX
   * used during the scanning process.
   */
  constructor({
    showIntroductionAlert = true,
    showHelpButton = true,
    preferredCameraPosition = CameraPosition.Back,
    allowHapticFeedback = true,
    allowScanSound = true,
  }: {
    showIntroductionAlert?: boolean;
    showHelpButton?: boolean;
    preferredCameraPosition?: CameraPosition;
    allowHapticFeedback?: boolean;
    allowScanSound?: boolean;
  } = {}) {
    this.showIntroductionAlert = showIntroductionAlert;
    this.showHelpButton = showHelpButton;
    this.preferredCameraPosition = preferredCameraPosition;
    this.allowHapticFeedback = allowHapticFeedback;
    this.allowScanSound = allowScanSound;
  }
}
