import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SampleLicenseConfig } from "./SampleLicenseConfig";
import {
  ExpansionSettingsCard,
  MultilineStringSettingField,
} from "./SampleUiComponents";

type Props = {
  config: SampleLicenseConfig;
  onChanged: () => void;
};

export function LicenseSettingsPanel({ config, onChanged }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>License</Text>
      <Text style={styles.hint}>
        Editing the license key for {config.activePlatformName} on this device.
        Changing the key unloads the SDK before the next scan.
      </Text>

      <ExpansionSettingsCard
        title={`License key (${config.activePlatformName})`}
      >
        <MultilineStringSettingField
          label="License key"
          value={config.activeLicenseKey}
          minLines={3}
          maxLines={6}
          onChanged={(value) => {
            config.activeLicenseKey = value;
            onChanged();
          }}
        />
      </ExpansionSettingsCard>

      <Pressable
        style={styles.resetButton}
        onPress={() => {
          config.resetActivePlatformToDefault();
          onChanged();
        }}
      >
        <Text style={styles.resetButtonText}>Reset license to sample default</Text>
      </Pressable>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  resetButton: { alignSelf: "flex-end", paddingVertical: 8 },
  resetButtonText: { fontSize: 14, color: "#1565C0", fontWeight: "500" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
    marginTop: 16,
    marginBottom: 8,
  },
});
