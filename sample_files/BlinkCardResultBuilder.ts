import {
  BlinkCardScanningResult,
  BlinkCardSingleSideScanningResult,
  CardAccountResult,
  CardLivenessCheckResult,
} from "@microblink/blinkcard-react-native";

export class BlinkCardResultBuilder {
  static getCardResultString(result?: BlinkCardScanningResult): string {
    if (result == null || result == undefined) {
      return "";
    }

    const resultString =
      this.buildStringResult("Cardholder name", result.cardholderName) +
      this.buildStringResult("IBAN", result.iban) +
      this.buildStringResult("Issuing network", result.issuingNetwork) +
      this.buildStringResult(
        "Overall card liveness result",
        result.overallCardLivenessResult,
      ) +
      this.buildCardAccounts(result.cardAccounts) +
      this.buildSingleSideScanningResult(
        "First side result",
        result.firstSideResult,
      ) +
      this.buildSingleSideScanningResult(
        "Second side result",
        result.secondSideResult,
      );

    return `${resultString}\n`;
  }

  static buildCardAccounts(cardAccounts?: CardAccountResult[]): string {
    if (!cardAccounts || cardAccounts.length === 0) return "";

    return cardAccounts
      .map((result, index) => {
        let cardAccountString = "";

        cardAccountString += this.buildStringResult(
          "Card category",
          result.cardCategory,
        );
        cardAccountString += this.buildStringResult(
          "Card number",
          result.cardNumber,
        );
        cardAccountString += this.buildStringResult(
          "Card number valid",
          result.cardNumberValid ? "YES" : "NO",
        );
        cardAccountString += this.buildStringResult(
          "Card number prefix",
          result.cardNumberPrefix,
        );
        cardAccountString += this.buildStringResult(
          "Expiry date",
          `${result.expiryDate?.month}/${result.expiryDate?.year}`,
        );
        cardAccountString += this.buildStringResult("CVV", result.cvv);
        cardAccountString += this.buildStringResult(
          "BIN check result",
          result.binCheckResult,
        );
        cardAccountString += this.buildStringResult(
          "Issuer name",
          result.issuerName,
        );
        cardAccountString += this.buildStringResult(
          "Issuer country code",
          result.issuerCountryCode,
        );
        cardAccountString += this.buildStringResult(
          "Issuer country",
          result.issuerCountry,
        );

        return `\nCard account ${index + 1} information:\n` + cardAccountString;
      })
      .join("");
  }

  static buildSingleSideScanningResult(
    name: string,
    result?: BlinkCardSingleSideScanningResult,
  ) {
    if (result == null || result == undefined) return "";

    const singleSideResultString = `Liveness check result:\n${this.buildCardLivenessCheckResult(
      result.cardLivenessCheckResult,
    )}`;

    return `\n${name}:\n${singleSideResultString}`;
  }

  static buildCardLivenessCheckResult(result?: CardLivenessCheckResult) {
    if (result == null) return "";
    const livenessCheckResultString =
      this.buildStringResult(
        "Card held in hand check result",
        result.cardHeldInHandCheckResult,
      ) +
      this.buildStringResult(
        "Photocopy check result",
        result.photocopyCheckResult,
      ) +
      this.buildStringResult("Screen check result", result.screenCheckResult);

    return livenessCheckResultString;
  }

  static buildStringResult(propertyName: string, result?: string) {
    if (
      result == null ||
      result == undefined ||
      result == "undefined" ||
      result == ""
    )
      return "";

    return `${propertyName}: ${result}\n`;
  }

  static buildNumberResult(propertyName: string, result?: number) {
    if (result == null || result == undefined || result < 0) return "";
    return `${propertyName}: ${result}\n`;
  }
}
