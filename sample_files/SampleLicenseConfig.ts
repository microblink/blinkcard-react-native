import { Platform } from "react-native";

/** Sample app license keys for QA (platform-specific). */
export class SampleLicenseConfig {
  static readonly defaultAndroidLicenseKey =
    "sRwCABVjb20ubWljcm9ibGluay5zYW1wbGUAbGV5SkRjbVZoZEdWa1QyNGlPakUzTnpJM01USXlOamt4T1RNc0lrTnlaV0YwWldSR2IzSWlPaUprWkdRd05qWmxaaTAxT0RJekxUUXdNRGd0T1RRNE1DMDFORFU0WWpBeFlUVTJZamdpZlE9PdXzP6loVm3KEys/pvWnco8AYZHWjNoSnU0owabUT/XVMbU2VhlvbyDzXfCeW+NkZJA3upTcu73cs/WbPzbsVoD6wjbHbYwP0+3f51CLps32C13bg/h9DS+73OYmTw==";

  static readonly defaultIosLicenseKey =
    "sRwCABVjb20ubWljcm9ibGluay5zYW1wbGUBbGV5SkRjbVZoZEdWa1QyNGlPakUzTnpJM01USXlNemt3T0Rrc0lrTnlaV0YwWldSR2IzSWlPaUprWkdRd05qWmxaaTAxT0RJekxUUXdNRGd0T1RRNE1DMDFORFU0WWpBeFlUVTJZamdpZlE9PXDZkGGlrcyQx8Ic8eGrb7YuRfJYO1Ez+bOLcQtLyQ3HNMc+htny28u5Etjj3BTk2Q39au9g1hJpJQm0J/utSGiRhQT/rVQFdFKU+vS4eUVr2im0FnMtdCS3EVofbA==";

  androidLicenseKey = SampleLicenseConfig.defaultAndroidLicenseKey;
  iosLicenseKey = SampleLicenseConfig.defaultIosLicenseKey;

  get activePlatformName(): string {
    if (Platform.OS === "android") return "Android";
    if (Platform.OS === "ios") return "iOS";
    return "Unknown";
  }

  get activeLicenseKey(): string {
    if (Platform.OS === "android") return this.androidLicenseKey;
    if (Platform.OS === "ios") return this.iosLicenseKey;
    return "";
  }

  set activeLicenseKey(value: string) {
    if (Platform.OS === "android") {
      this.androidLicenseKey = value;
    } else if (Platform.OS === "ios") {
      this.iosLicenseKey = value;
    }
  }

  get trimmedActiveLicenseKey(): string {
    return this.activeLicenseKey.trim();
  }

  get hasValidActiveLicenseKey(): boolean {
    return this.trimmedActiveLicenseKey.length > 0;
  }

  resetActivePlatformToDefault(): void {
    if (Platform.OS === "android") {
      this.androidLicenseKey = SampleLicenseConfig.defaultAndroidLicenseKey;
    } else if (Platform.OS === "ios") {
      this.iosLicenseKey = SampleLicenseConfig.defaultIosLicenseKey;
    }
  }

  /** Short prefix for debug logs (do not log full license keys). */
  activeLicenseKeyLogLabel(): string {
    const key = this.trimmedActiveLicenseKey;
    if (key.length === 0) return "(empty)";
    if (key.length <= 12) return "(set)";
    return `${key.substring(0, 8)}…`;
  }
}
