import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SensitivityLevel } from "@microblink/blinkcard-react-native";
import {
  ScanningSettingsConfig,
  TILT_SENSITIVITY_LEVELS,
} from "./ScanningSettingsConfig";
import {
  BoolSettingTile,
  DoubleSettingField,
  EnumDropdown,
  ExpansionSettingsCard,
  IntSettingField,
} from "./SampleUiComponents";

type Props = {
  config: ScanningSettingsConfig;
  onChanged: () => void;
};

export function ScanningSettingsPanel({ config, onChanged }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Scanning settings</Text>
      <Text style={styles.hint}>
        Settings apply to all scan actions below.
      </Text>

      <ExpansionSettingsCard
        title="Image quality & framing"
        subtitle="Input image margin applies to camera scan (video) only"
      >
        <BoolSettingTile
          title="Skip images with blur"
          subtitle="Reject blurred frames during scanning"
          value={config.skipImagesWithBlur}
          onChanged={(value) => {
            config.skipImagesWithBlur = value;
            onChanged();
          }}
        />
        <EnumDropdown<SensitivityLevel>
          label="Tilt sensitivity level"
          value={config.tiltSensitivityLevel}
          options={TILT_SENSITIVITY_LEVELS}
          onChanged={(level) => {
            config.tiltSensitivityLevel = level;
            onChanged();
          }}
        />
        <DoubleSettingField
          label="Input image margin"
          value={config.inputImageMargin}
          min={0}
          max={1}
          onChanged={(value) => {
            config.inputImageMargin = value;
            onChanged();
          }}
        />
      </ExpansionSettingsCard>

      <ExpansionSettingsCard
        title="Extraction"
        subtitle="Fields to read from the card"
      >
        <BoolSettingTile
          title="Extract IBAN"
          value={config.extractIban}
          onChanged={(value) => {
            config.extractIban = value;
            onChanged();
          }}
        />
        <BoolSettingTile
          title="Extract expiry date"
          value={config.extractExpiryDate}
          onChanged={(value) => {
            config.extractExpiryDate = value;
            onChanged();
          }}
        />
        <BoolSettingTile
          title="Extract cardholder name"
          value={config.extractCardholderName}
          onChanged={(value) => {
            config.extractCardholderName = value;
            onChanged();
          }}
        />
        <BoolSettingTile
          title="Extract CVV"
          value={config.extractCvv}
          onChanged={(value) => {
            config.extractCvv = value;
            onChanged();
          }}
        />
        <BoolSettingTile
          title="Extract invalid card number"
          subtitle="Accept card numbers that fail Luhn checksum"
          value={config.extractInvalidCardNumber}
          onChanged={(value) => {
            config.extractInvalidCardNumber = value;
            onChanged();
          }}
        />
      </ExpansionSettingsCard>

      <ExpansionSettingsCard
        title="Cropped image"
        subtitle="Card image returned in the scan result"
      >
        <BoolSettingTile
          title="Return card image"
          value={config.returnCardImage}
          onChanged={(value) => {
            config.returnCardImage = value;
            onChanged();
          }}
        />
        <IntSettingField
          label="Dots per inch"
          value={config.croppedImageDotsPerInch}
          min={100}
          max={400}
          onChanged={(value) => {
            config.croppedImageDotsPerInch = value;
            onChanged();
          }}
        />
        <DoubleSettingField
          label="Extension factor"
          value={config.croppedImageExtensionFactor}
          min={0}
          max={1}
          onChanged={(value) => {
            config.croppedImageExtensionFactor = value;
            onChanged();
          }}
        />
      </ExpansionSettingsCard>

      <Pressable
        style={styles.resetButton}
        onPress={() => {
          config.resetScanningSettingsToDefaults();
          onChanged();
        }}
      >
        <Text style={styles.resetButtonText}>
          Reset scanning settings to defaults
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  resetButton: { alignSelf: "flex-end", paddingVertical: 8 },
  resetButtonText: { fontSize: 14, color: "#1565C0", fontWeight: "500" },
});
