/**
 * Represents the different levels of detection sensitivity.
 *
 * This enum is used to configure detection thresholds and enable or disable detection functionality.
 * The levels range from turning detection off completely to setting various levels of sensitivity (Low, Mid, High).
 */
export enum SensitivityLevel {
  Off = 'off',
  Low = 'low',
  Mid = 'mid',
  High = 'high',
}

/**
 * Defines the strictness level used by various models to control detection sensitivity.
 *
 * Higher levels apply stricter validation criteria, improving security and reducing false accepts (FAR), but may increase false rejects (FRR).
 *
 * Levels are ordered by increasing strictness:
 *
 * 1. Disabled turns the check off.
 * 2. The first active level has the lowest FRR and highest FAR.
 * 3. The last level has the highest FRR and lowest FAR.
 */
export enum StrictnessLevel {
  Disabled = 'disabled',
  Level1 = 'level1',
  Level2 = 'level2',
  Level3 = 'level3',
  Level4 = 'level4',
  Level5 = 'level5',
  Level6 = 'level6',
  Level7 = 'level7',
  Level8 = 'level8',
  Level9 = 'level9',
  Level10 = 'level10',
}

/**
 * Represents level of redaction performed on the scanning result.
 */
export enum RedactionMode {
  /**
   * Redaction will not be performed.
   */
  None = 'none',
  /**
   * Full document image is redacted with black boxes covering sensitive data.
   */
  ImageOnly = 'imageOnly',
  /**
   * Result fields containing sensitive data are removed from result.
   */
  ResultFieldsOnly = 'resultFieldsOnly',
  /**
   * This mode is combination of ImageOnly and ResultFieldsOnly modes.
   */
  FullResult = 'fullResult',
}

/**
 * Result of a single check performed during the document verification process.
 */
export enum CheckResult {
  NotAvailable = 'notAvailable',
  Pass = 'pass',
  Fail = 'fail',
}

/**
 * Represents camera positions used for card information extraction.
 */
export enum CameraPosition {
  /**
   * Front-facing camera
   */
  Front = 'front',
  /**
   * Back-facing camera
   */
  Back = 'back',
}

/**
 * Holds the settings which control card number redaction.
 */
export class CardNumberRedactionSettings {
  /**
   * Defines the mode of card number redaction.
   *
   * Default: [RedactionMode.fullResult]
   */
  mode: RedactionMode;
  /**
   * Defines how many digits at the beginning
   * of the card number remain visible after redaction.
   *
   * Default: `4`
   */
  prefixDigitsVisible: number;
  /**
   * Defines how many digits at the end
   * of the card number remain visible after redaction.
   *
   * Default: `4`
   */
  suffixDigitsVisible: number;

  constructor({
    mode = RedactionMode.FullResult,
    prefixDigitsVisible = 4,
    suffixDigitsVisible = 4,
  }: {
    mode?: RedactionMode;
    prefixDigitsVisible?: number;
    suffixDigitsVisible?: number;
  } = {}) {
    this.mode = mode;
    this.prefixDigitsVisible = prefixDigitsVisible;
    this.suffixDigitsVisible = suffixDigitsVisible;
  }
}

/**
 * Represents the account information of a single account on a card.
 */
export class CardAccountResult {
  /**
   * The card number as scanned from the card.
   */
  cardNumber: string;

  /**
   * Indicates whether the scanned card number is valid according to the Luhn algorithm.
   */
  cardNumberValid: boolean;

  /**
   * The payment card's number prefix.
   */
  cardNumberPrefix?: string;

  /**
   * The payment card's security code/value.
   */
  cvv?: string;

  /**
   * The payment card's expiry date.
   */
  expiryDate: DateResult<string>;

  /**
   * The card funding type (e.g., "DEBIT", "CREDIT", "CHARGE CARD").
   */
  fundingType?: string;

  /**
   * The category of the payment card
   * (e.g., "PERSONAL", "BUSINESS", "PREPAID").
   *
   * This information typically indicates the card's tier or service level.
   */
  cardCategory?: string;

  /**
   * The name of the financial institution that issued the payment card.
   */
  issuerName?: string;

  /**
   * The ISO 3166-1 alpha-3 country code of the card issuer's country (e.g., "USA", "GBR", "HRV").
   */
  issuerCountryCode?: string;

  /**
   * The name of the card issuer's country.
   */
  issuerCountry?: string;

  /**
   * Result of the BIN (Bank Identification Number) check for this account.
   */
  binCheckResult: CheckResult;

  constructor(nativeCardAccountResult: any) {
    this.cardNumber = nativeCardAccountResult.cardNumber;
    this.cardNumberValid = nativeCardAccountResult.cardNumberValid;
    this.cardNumberPrefix = nativeCardAccountResult.cardNumberPrefix;
    this.cvv = nativeCardAccountResult.cvv;
    this.expiryDate = nativeCardAccountResult.expiryDate;
    this.fundingType = nativeCardAccountResult.fundingType;
    this.cardCategory = nativeCardAccountResult.cardCategory;
    this.issuerName = nativeCardAccountResult.issuerName;
    this.issuerCountryCode = nativeCardAccountResult.issuerCountryCode;
    this.issuerCountry = nativeCardAccountResult.issuerCountry;
    this.binCheckResult = nativeCardAccountResult.binCheckResult;
  }
}

/**
 * Represents the result of the date extraction.
 */
export class DateResult<StringType> {
  /**
   * Day of the month.
   *
   * The first day of the month has value `1`
   */
  day?: number;

  /**
   * Month of the year.
   *
   * The first month of the year has value `1`
   */
  month?: number;

  /**
   * Full year.
   */
  year?: number;

  /**
   * Original string representation of the date which has been extracted.
   */
  originalString: StringType;

  /**
   * Indicates that date does not appear on the document
   * but is filled by our internal domain knowledge.
   */
  filledByDomainKnowledge: boolean;

  /**
   * Indicates whether date was successfully parsed.
   */
  successfullyParsed: boolean;

  constructor(nativeDateResult: any) {
    this.day = nativeDateResult.day;
    this.month = nativeDateResult.month;
    this.year = nativeDateResult.year;
    this.originalString = nativeDateResult.originalString;
    this.filledByDomainKnowledge = nativeDateResult.filledByDomainKnowledge;
    this.successfullyParsed = nativeDateResult.successfullyParsed;
  }
}
/**
 * Represents the result of scanning a single side of the card.
 *
 * Contains the cropped card image and liveness check results
 * from scanning one side of a card.
 */
export class BlinkCardSingleSideScanningResult {
  /**
   * The cropped image of the scanned card, or null if image capture failed.
   */
  cardImage?: CroppedImageResult;
  /**
   * The result of the card liveness verification check.
   */
  cardLivenessCheckResult: CardLivenessCheckResult;

  constructor(nativeBlinkCardSingleSideScanningResult: any) {
    this.cardImage = nativeBlinkCardSingleSideScanningResult.cardImage;
    this.cardLivenessCheckResult =
      nativeBlinkCardSingleSideScanningResult.cardLivenessCheckResult;
  }
}

export class CroppedImageResult {
  image?: string;

  constructor(nativeCroppedImageResult: any) {
    this.image = nativeCroppedImageResult.image;
  }
}

/**
 * Structure representing the result of liveness checks for a card.
 */
export class CardLivenessCheckResult {
  /**
   * Result of the liveness check that detects whether the card is displayed on a screen.
   */
  screenCheckResult: CheckResult;
  /**
   * Result of the liveness check that detects whether the input image is a photocopy of a card.
   */
  photocopyCheckResult: CheckResult;
  /**
   * Result of the liveness check that detects whether a card is being held in human hands.
   */
  cardHeldInHandCheckResult: CheckResult;

  constructor(nativeCardLivenessCheckResult: any) {
    this.screenCheckResult = nativeCardLivenessCheckResult.screenCheckResult;
    this.photocopyCheckResult =
      nativeCardLivenessCheckResult.photocopyCheckResult;
    this.cardHeldInHandCheckResult =
      nativeCardLivenessCheckResult.cardHeldInHandCheckResult;
  }
}
