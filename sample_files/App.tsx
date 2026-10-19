import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import {
  BlinkCardScanningResult,
  BlinkCardSdkSettings,
  CameraPosition,
  loadSdk,
  performDirectApiScan,
  performScan,
  ScanningUxSettings,
  unloadSdk,
} from "@microblink/blinkcard-react-native";
import { BlinkCardResultBuilder } from "./BlinkCardResultBuilder";
import { LicenseSettingsPanel } from "./LicenseSettingsPanel";
import { OptionalScanSettingsPanel } from "./OptionalScanSettingsPanel";
import { SampleLicenseConfig } from "./SampleLicenseConfig";
import { ScanningSettingsPanel } from "./ScanningSettingsPanel";
import { ScanningSettingsConfig } from "./ScanningSettingsConfig";
import { SdkLifecyclePanel } from "./SdkLifecyclePanel";

const INITIAL_RESULT_HINT =
  'Press "Scan with camera" to scan with the default BlinkCard UX.\n\n' +
  'Press "DirectAPI two side scan" or "DirectAPI one side scan" to scan static images.';

export default function App() {
  const scanConfig = useRef(new ScanningSettingsConfig()).current;
  const licenseConfig = useRef(new SampleLicenseConfig()).current;
  const lastInitializedLicenseKey = useRef<string | null>(null);
  const scanInProgressRef = useRef(false);
  const [, setConfigVersion] = useState(0);
  const onConfigChanged = () => setConfigVersion((v) => v + 1);

  const [result, setResult] = useState<string>(INITIAL_RESULT_HINT);
  const [firstSideImage, setFirstSideImage] = useState<string>();
  const [secondSideImage, setSecondSideImage] = useState<string>();
  const [scanInProgress, setScanInProgress] = useState(false);
  const [sdkLifecycleInProgress, setSdkLifecycleInProgress] = useState(false);
  const [deleteCachedResourcesOnUnload, setDeleteCachedResourcesOnUnload] =
    useState(false);

  const sdkActionsEnabled = !scanInProgress && !sdkLifecycleInProgress;

  const buildSdkSettings = () => {
    const sdkSettings = new BlinkCardSdkSettings({
      licenseKey: licenseConfig.trimmedActiveLicenseKey,
    });
    sdkSettings.downloadResources = true;
    return sdkSettings;
  };

  const buildUxSettings = () =>
    new ScanningUxSettings({
      showHelpButton: true,
      showIntroductionAlert: false,
      preferredCameraPosition: CameraPosition.Back,
      allowHapticFeedback: true,
    });

  const logScanConfiguration = (action: string) => {
    const sessionSettings = scanConfig.buildSessionSettings();
    const redaction = scanConfig.toRedactionSettings();
    console.log(`[BlinkCardSample] ${action}`);
    console.log(
      `[BlinkCardSample] license (${licenseConfig.activePlatformName}): ${licenseConfig.activeLicenseKeyLogLabel()}`,
    );
    console.log(
      `[BlinkCardSample] redactionSettingsEnabled: ${scanConfig.redactionSettingsEnabled}`,
    );
    console.log(
      `[BlinkCardSample] redactionSettings: ${redaction != null ? JSON.stringify(redaction) : "null"}`,
    );
    console.log(
      `[BlinkCardSample] full sessionSettings JSON: ${JSON.stringify(sessionSettings)}`,
    );
  };

  const showInstructions = (
    title: string,
    message: string,
    onOk: () => void,
  ) => {
    Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
  };

  const syncSdkForCurrentLicense = async (): Promise<boolean> => {
    if (!licenseConfig.hasValidActiveLicenseKey) {
      setResult("License key is required.");
      resetImages();
      return false;
    }

    const licenseKey = licenseConfig.trimmedActiveLicenseKey;
    if (
      lastInitializedLicenseKey.current != null &&
      lastInitializedLicenseKey.current !== licenseKey
    ) {
      try {
        await unloadSdk(false);
      } catch (error) {
        console.log(
          `[BlinkCardSample] unloadSdk before license change: ${error}`,
        );
      }
    }

    lastInitializedLicenseKey.current = licenseKey;
    return true;
  };

  const runScan = async (scanAction: () => Promise<void>) => {
    if (scanInProgressRef.current) {
      return;
    }
    scanInProgressRef.current = true;
    setScanInProgress(true);
    try {
      if (!(await syncSdkForCurrentLicense())) {
        return;
      }
      await scanAction();
    } finally {
      scanInProgressRef.current = false;
      setScanInProgress(false);
    }
  };

  const loadSdkManually = async () => {
    if (!sdkActionsEnabled) {
      return;
    }
    if (!(await syncSdkForCurrentLicense())) {
      return;
    }
    setSdkLifecycleInProgress(true);
    try {
      await loadSdk(buildSdkSettings());
      setResult("SDK loaded successfully.");
    } catch (error) {
      lastInitializedLicenseKey.current = null;
      setResult(`Load SDK error: ${error}`);
    } finally {
      setSdkLifecycleInProgress(false);
    }
  };

  const unloadSdkManually = async () => {
    if (!sdkActionsEnabled) {
      return;
    }
    setSdkLifecycleInProgress(true);
    try {
      await unloadSdk(deleteCachedResourcesOnUnload);
      lastInitializedLicenseKey.current = null;
      setResult(
        deleteCachedResourcesOnUnload
          ? "SDK unloaded (cached resources deleted)."
          : "SDK unloaded.",
      );
    } catch (error) {
      setResult(`Unload SDK error: ${error}`);
    } finally {
      setSdkLifecycleInProgress(false);
    }
  };

  const handlePerformScan = () =>
    runScan(async () => {
      try {
        setResult("");
        resetImages();
        logScanConfiguration("Scan with camera");
        const blinkCardResult = await performScan(
          buildSdkSettings(),
          scanConfig.buildSessionSettings(),
          buildUxSettings(),
        );
        setResult(BlinkCardResultBuilder.getCardResultString(blinkCardResult));
        setImages(blinkCardResult);
      } catch (error) {
        setResult(`BlinkCard scanning error: ${error}`);
        resetImages();
      }
    });

  const handlePerformDirectApiTwoSideScan = () =>
    runScan(async () => {
      try {
        setResult("");
        resetImages();
        logScanConfiguration("DirectAPI two sides");

        const pickerResult = await launchImageLibrary({
          mediaType: "photo",
          selectionLimit: 2,
          includeBase64: true,
        });

        if (pickerResult.didCancel) {
          return;
        }

        const assets = pickerResult.assets;
        if (
          !assets ||
          assets.length < 2 ||
          !assets[0]?.base64 ||
          !assets[1]?.base64
        ) {
          setResult(
            "Select two images. The first must be the side where the card number is located; the second must be the other side.",
          );
          return;
        }

        const blinkCardResult = await performDirectApiScan(
          buildSdkSettings(),
          scanConfig.buildSessionSettings(),
          assets[0].base64,
          assets[1].base64,
        );
        setResult(BlinkCardResultBuilder.getCardResultString(blinkCardResult));
        setImages(blinkCardResult);
      } catch (error) {
        setResult(`BlinkCard DirectAPI error: ${error}`);
        resetImages();
      }
    });

  const handlePerformDirectApiOneSideScan = () =>
    runScan(async () => {
      try {
        setResult("");
        resetImages();
        logScanConfiguration("DirectAPI one side");

        const pickerResult = await launchImageLibrary({
          mediaType: "photo",
          includeBase64: true,
        });

        if (pickerResult.didCancel || !pickerResult.assets?.[0]?.base64) {
          return;
        }

        const blinkCardResult = await performDirectApiScan(
          buildSdkSettings(),
          scanConfig.buildSessionSettings(),
          pickerResult.assets[0].base64,
        );
        setResult(BlinkCardResultBuilder.getCardResultString(blinkCardResult));
        setImages(blinkCardResult);
      } catch (error) {
        setResult(`BlinkCard DirectAPI error: ${error}`);
        resetImages();
      }
    });

  function setImages(scanResult: BlinkCardScanningResult | undefined) {
    setFirstSideImage(scanResult?.firstSideResult?.cardImage?.image);
    setSecondSideImage(scanResult?.secondSideResult?.cardImage?.image);
  }

  function resetImages() {
    setFirstSideImage(undefined);
    setSecondSideImage(undefined);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BlinkCard Sample</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
          <LicenseSettingsPanel
            config={licenseConfig}
            onChanged={onConfigChanged}
          />
          <ScanningSettingsPanel
            config={scanConfig}
            onChanged={onConfigChanged}
          />
          <OptionalScanSettingsPanel
            config={scanConfig}
            onChanged={onConfigChanged}
          />
          <SdkLifecyclePanel
            deleteCachedResourcesOnUnload={deleteCachedResourcesOnUnload}
            onDeleteCachedResourcesOnUnloadChanged={
              setDeleteCachedResourcesOnUnload
            }
            onLoadSdk={loadSdkManually}
            onUnloadSdk={unloadSdkManually}
            actionsEnabled={sdkActionsEnabled}
          />

          <View style={styles.buttonBlock}>
            <ScanActionButton
              title="Scan with camera"
              enabled={sdkActionsEnabled}
              onPress={handlePerformScan}
            />
          </View>
          <View style={styles.buttonBlock}>
            <ScanActionButton
              title="DirectAPI two side scan"
              enabled={sdkActionsEnabled}
              onPress={() =>
                showInstructions(
                  "DirectAPI TwoSides instructions",
                  "Select two images for processing.\nThe first selected image needs to be side where the card number is located.\nThe second image needs to be the other side of the card.",
                  handlePerformDirectApiTwoSideScan,
                )
              }
            />
          </View>
          <View style={styles.buttonBlock}>
            <ScanActionButton
              title="DirectAPI one side scan"
              enabled={sdkActionsEnabled}
              onPress={() =>
                showInstructions(
                  "DirectAPI OneSide instructions",
                  "Select one image for processing.\nThe image needs to be side of the card where the card number is located.",
                  handlePerformDirectApiOneSideScan,
                )
              }
            />
          </View>

          <Text style={styles.resultText}>{result}</Text>

          {firstSideImage ? (
            <DocumentImageContainer
              label="First card image:"
              imageUri={`data:image/jpeg;base64,${firstSideImage}`}
            />
          ) : null}
          {secondSideImage ? (
            <DocumentImageContainer
              label="Second card image:"
              imageUri={`data:image/jpeg;base64,${secondSideImage}`}
            />
          ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type ScanActionButtonProps = {
  title: string;
  enabled: boolean;
  onPress: () => void;
};

function ScanActionButton({ title, enabled, onPress }: ScanActionButtonProps) {
  return (
    <Pressable
      style={[styles.actionButton, !enabled && styles.actionButtonDisabled]}
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
    >
      <Text
        style={[
          styles.actionButtonText,
          !enabled && styles.actionButtonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

type DocumentImageContainerProps = {
  label: string;
  imageUri: string;
};

const DocumentImageContainer: React.FC<DocumentImageContainerProps> = ({
  label,
  imageUri,
}) => (
  <View style={styles.imageBlock}>
    <Text style={styles.imageLabel}>{label}</Text>
    <Image
      source={{ uri: imageUri }}
      style={styles.image}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1565C0",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#1565C0",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  scroll: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  buttonBlock: { marginBottom: 16 },
  actionButton: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonDisabled: {
    backgroundColor: "#90A4AE",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtonTextDisabled: { color: "#fff", opacity: 0.85 },
  resultText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  imageBlock: { alignItems: "center", marginBottom: 16 },
  imageLabel: { fontSize: 14, marginBottom: 8 },
  image: {
    width: 350,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
});
