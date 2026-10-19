import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BoolSettingTile,
  ExpansionSettingsCard,
} from "./SampleUiComponents";

type LifecycleProps = {
  deleteCachedResourcesOnUnload: boolean;
  onDeleteCachedResourcesOnUnloadChanged: (value: boolean) => void;
  onLoadSdk: () => void;
  onUnloadSdk: () => void;
  actionsEnabled: boolean;
};

export function SdkLifecyclePanel({
  deleteCachedResourcesOnUnload,
  onDeleteCachedResourcesOnUnloadChanged,
  onLoadSdk,
  onUnloadSdk,
  actionsEnabled,
}: LifecycleProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>SDK lifecycle (optional)</Text>
      <Text style={styles.hint}>
        Not required for integration—scan actions initialize the SDK
        automatically. Use Load SDK to preload resources and Unload SDK to tear
        down the native instance.
      </Text>

      <ExpansionSettingsCard title="Load / unload SDK">
        <BoolSettingTile
          title="Delete cached resources on unload"
          subtitle="Full cleanup including downloaded SDK assets"
          value={deleteCachedResourcesOnUnload}
          onChanged={onDeleteCachedResourcesOnUnloadChanged}
        />
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.outlineButton,
              !actionsEnabled && styles.outlineButtonDisabled,
            ]}
            onPress={actionsEnabled ? onLoadSdk : undefined}
            disabled={!actionsEnabled}
          >
            <Text
              style={[
                styles.outlineButtonText,
                !actionsEnabled && styles.outlineButtonTextDisabled,
              ]}
            >
              Load SDK
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.outlineButton,
              !actionsEnabled && styles.outlineButtonDisabled,
            ]}
            onPress={actionsEnabled ? onUnloadSdk : undefined}
            disabled={!actionsEnabled}
          >
            <Text
              style={[
                styles.outlineButtonText,
                !actionsEnabled && styles.outlineButtonTextDisabled,
              ]}
            >
              Unload SDK
            </Text>
          </Pressable>
        </View>
      </ExpansionSettingsCard>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonDisabled: {
    borderColor: "#bbb",
    opacity: 0.6,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1565C0",
  },
  outlineButtonTextDisabled: { color: "#999" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
    marginTop: 16,
    marginBottom: 8,
  },
});
