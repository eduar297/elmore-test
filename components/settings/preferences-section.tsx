import { usePreferences } from "@/contexts/preferences-context";
import { useColors } from "@/hooks/use-colors";
import { Store } from "@tamagui/lucide-icons";
import React from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { settingStyles as styles } from "./shared";

export function PreferencesSection() {
  const c = useColors();
  const { showStoreBubble, setShowStoreBubble } = usePreferences();

  return (
    <ScrollView contentContainerStyle={styles.profileContent}>
      <View
        style={[
          styles.profileCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <Store size={14} color={c.blue as any} />
          <Text style={[styles.cardTitle, { color: c.text }]}>Tienda</Text>
        </View>

        <View style={styles.prefRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.workerName, { color: c.text }]}>
              Burbuja de tienda activa
            </Text>
            <Text style={[styles.workerMeta, { color: c.muted }]}>
              Muestra un indicador flotante con la tienda actual en toda la app
            </Text>
          </View>
          <Switch
            value={showStoreBubble}
            onValueChange={setShowStoreBubble}
            trackColor={{ false: c.border, true: c.blue }}
            accessibilityLabel="Activar burbuja de tienda"
          />
        </View>
      </View>
    </ScrollView>
  );
}
