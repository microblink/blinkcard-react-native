import {
  BlinkCardSessionSettings,
  CardNumberRedactionSettings,
  CroppedImageSettings,
  ExtractionSettings,
  LivenessSettings,
  RedactionMode,
  RedactionSettings,
  ScanningSettings,
  SensitivityLevel,
  StrictnessLevel,
} from "@microblink/blinkcard-react-native";

export const TILT_SENSITIVITY_LEVELS: readonly SensitivityLevel[] = [
  SensitivityLevel.Off,
  SensitivityLevel.Low,
  SensitivityLevel.Mid,
  SensitivityLevel.High,
];

/** UI-driven sample configuration for the BlinkCard sample app. */
export class ScanningSettingsConfig {
  skipImagesWithBlur = true;
  tiltSensitivityLevel: SensitivityLevel = SensitivityLevel.Mid;
  inputImageMargin = 0.02;

  extractIban = true;
  extractExpiryDate = true;
  extractCardholderName = true;
  extractCvv = true;
  extractInvalidCardNumber = false;

  returnCardImage = true;
  croppedImageDotsPerInch = 250;
  croppedImageExtensionFactor = 0.0;

  redactionSettingsEnabled = true;

  cardholderNameRedactionMode: RedactionMode = RedactionMode.None;
  cvvRedactionMode: RedactionMode = RedactionMode.FullResult;
  ibanRedactionMode: RedactionMode = RedactionMode.None;
  cardNumberRedactionMode: RedactionMode = RedactionMode.FullResult;
  cardNumberPrefixDigitsVisible = 4;
  cardNumberSuffixDigitsVisible = 4;

  static defaultRedactionSettings(): RedactionSettings {
    return new RedactionSettings({
      cardholderNameRedactionMode: RedactionMode.None,
      cvvRedactionMode: RedactionMode.FullResult,
      ibanRedactionMode: RedactionMode.None,
      cardNumberRedactionSettings: new CardNumberRedactionSettings({
        mode: RedactionMode.FullResult,
        prefixDigitsVisible: 4,
        suffixDigitsVisible: 4,
      }),
    });
  }

  resetScanningSettingsToDefaults(): void {
    this.skipImagesWithBlur = true;
    this.tiltSensitivityLevel = SensitivityLevel.Mid;
    this.inputImageMargin = 0.02;

    this.extractIban = true;
    this.extractExpiryDate = true;
    this.extractCardholderName = true;
    this.extractCvv = true;
    this.extractInvalidCardNumber = false;

    this.returnCardImage = true;
    this.croppedImageDotsPerInch = 250;
    this.croppedImageExtensionFactor = 0.0;
  }

  buildExtractionSettings(): ExtractionSettings {
    return new ExtractionSettings({
      extractIban: this.extractIban,
      extractExpiryDate: this.extractExpiryDate,
      extractCardholderName: this.extractCardholderName,
      extractCvv: this.extractCvv,
      extractInvalidCardNumber: this.extractInvalidCardNumber,
    });
  }

  buildCroppedImageSettings(): CroppedImageSettings {
    return new CroppedImageSettings({
      returnCardImage: this.returnCardImage,
      dotsPerInch: this.croppedImageDotsPerInch,
      extensionFactor: this.croppedImageExtensionFactor,
    });
  }

  resetRedactionToDefaults(): void {
    this.redactionSettingsEnabled = true;
    const defaults = ScanningSettingsConfig.defaultRedactionSettings();
    this.cardholderNameRedactionMode = defaults.cardholderNameRedactionMode;
    this.cvvRedactionMode = defaults.cvvRedactionMode;
    this.ibanRedactionMode = defaults.ibanRedactionMode;
    this.cardNumberRedactionMode =
      defaults.cardNumberRedactionSettings.mode;
    this.cardNumberPrefixDigitsVisible =
      defaults.cardNumberRedactionSettings.prefixDigitsVisible;
    this.cardNumberSuffixDigitsVisible =
      defaults.cardNumberRedactionSettings.suffixDigitsVisible;
  }

  toRedactionSettings(): RedactionSettings | undefined {
    if (!this.redactionSettingsEnabled) {
      return undefined;
    }
    return new RedactionSettings({
      cardholderNameRedactionMode: this.cardholderNameRedactionMode,
      cvvRedactionMode: this.cvvRedactionMode,
      ibanRedactionMode: this.ibanRedactionMode,
      cardNumberRedactionSettings: new CardNumberRedactionSettings({
        mode: this.cardNumberRedactionMode,
        prefixDigitsVisible: this.cardNumberPrefixDigitsVisible,
        suffixDigitsVisible: this.cardNumberSuffixDigitsVisible,
      }),
    });
  }

  buildScanningSettings(): ScanningSettings {
    const livenessSettings = new LivenessSettings({
      enableCardHeldInHandCheck: true,
      photocopyCheckStrictnessLevel: StrictnessLevel.Level5,
    });

    return new ScanningSettings({
      skipImagesWithBlur: this.skipImagesWithBlur,
      tiltSensitivityLevel: this.tiltSensitivityLevel,
      inputImageMargin: this.inputImageMargin,
      livenessSettings,
      extractionSettings: this.buildExtractionSettings(),
      croppedImageSettings: this.buildCroppedImageSettings(),
      redactionSettings: this.toRedactionSettings(),
    });
  }

  buildSessionSettings(): BlinkCardSessionSettings {
    return new BlinkCardSessionSettings({
      scanningSettings: this.buildScanningSettings(),
    });
  }
}
