import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RedactionMode } from "@microblink/blinkcard-react-native";
import { REDACTION_MODES } from "./sampleRedactionOptions";
import { ScanningSettingsConfig } from "./ScanningSettingsConfig";
import {
  EnumDropdown,
  IntSettingField,
  ModuleCard,
  SectionLabel,
} from "./SampleUiComponents";

type Props = {
  config: ScanningSettingsConfig;
  onChanged: () => void;
};

export function OptionalScanSettingsPanel({ config, onChanged }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Optional scan settings</Text>
      <Text style={styles.hint}>
        Redaction applies to all scan actions below. Toggle off: native SDK
        default policy (still redacts). Toggle on: custom settings. For
        unredacted data, set all modes to none.
      </Text>

      <ModuleCard
        title="Redaction settings"
        subtitle={
          config.redactionSettingsEnabled
            ? "Custom redaction"
            : "No custom redaction — SDK defaults apply"
        }
        enabled={config.redactionSettingsEnabled}
        onEnabledChanged={(enabled) => {
          config.redactionSettingsEnabled = enabled;
          onChanged();
        }}
      >
        <Text style={styles.moduleHint}>
          Requires matching extraction flags (e.g. CVV redaction needs
          extractCvv). Use returned card images to verify image redaction.
        </Text>
        <EnumDropdown<RedactionMode>
          label="Cardholder name"
          value={config.cardholderNameRedactionMode}
          options={REDACTION_MODES}
          onChanged={(mode) => {
            config.cardholderNameRedactionMode = mode;
            onChanged();
          }}
        />
        <EnumDropdown<RedactionMode>
          label="CVV"
          value={config.cvvRedactionMode}
          options={REDACTION_MODES}
          onChanged={(mode) => {
            config.cvvRedactionMode = mode;
            onChanged();
          }}
        />
        <EnumDropdown<RedactionMode>
          label="IBAN"
          value={config.ibanRedactionMode}
          options={REDACTION_MODES}
          onChanged={(mode) => {
            config.ibanRedactionMode = mode;
            onChanged();
          }}
        />
        <SectionLabel text="Card number" />
        <EnumDropdown<RedactionMode>
          label="Card number mode"
          value={config.cardNumberRedactionMode}
          options={REDACTION_MODES}
          onChanged={(mode) => {
            config.cardNumberRedactionMode = mode;
            onChanged();
          }}
        />
        <IntSettingField
          label="Prefix digits visible"
          value={config.cardNumberPrefixDigitsVisible}
          min={0}
          max={20}
          onChanged={(value) => {
            config.cardNumberPrefixDigitsVisible = value;
            onChanged();
          }}
        />
        <IntSettingField
          label="Suffix digits visible"
          value={config.cardNumberSuffixDigitsVisible}
          min={0}
          max={20}
          onChanged={(value) => {
            config.cardNumberSuffixDigitsVisible = value;
            onChanged();
          }}
        />
      </ModuleCard>

      <Pressable
        style={styles.resetButton}
        onPress={() => {
          config.resetRedactionToDefaults();
          onChanged();
        }}
      >
        <Text style={styles.resetButtonText}>Reset redaction to defaults</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  moduleHint: {
    fontSize: 12,
    color: "#666",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  resetButton: { alignSelf: "flex-end", paddingVertical: 8 },
  resetButtonText: { fontSize: 14, color: "#1565C0", fontWeight: "500" },
});
