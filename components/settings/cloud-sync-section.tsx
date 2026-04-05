import { useDevice } from "@/contexts/device-context";
import { useStore } from "@/contexts/store-context";
import { useColors } from "@/hooks/use-colors";
import type { CloudSyncProgress } from "@/services/supabase/cloud-sync";
import {
    downloadFromCloud,
    isCloudSyncAvailable,
    uploadToCloud,
} from "@/services/supabase/cloud-sync";
import {
    AlertCircle,
    ArrowDownToLine,
    ArrowUpFromLine,
    CheckCircle,
    Cloud,
    CloudOff,
} from "@tamagui/lucide-icons";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { settingStyles } from "./shared";

type SyncState =
  | "idle"
  | "checking"
  | "uploading"
  | "downloading"
  | "done"
  | "error";

export function CloudSyncSection() {
  const c = useColors();
  const db = useSQLiteContext();
  const { businessId, deviceId } = useDevice();
  const { refreshStores, setCurrentStore } = useStore();

  const [available, setAvailable] = useState<boolean | null>(null);
  const [state, setState] = useState<SyncState>("idle");
  const [progress, setProgress] = useState<CloudSyncProgress | null>(null);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Check availability on mount
  useEffect(() => {
    isCloudSyncAvailable().then(setAvailable);
  }, []);

  const handleProgress = useCallback((p: CloudSyncProgress) => {
    setProgress(p);
    if (p.phase === "done") {
      setState("done");
    } else if (p.phase === "error") {
      setState("error");
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (!businessId) {
      setError("No hay negocio activado");
      return;
    }

    Alert.alert(
      "Respaldo en la nube",
      "Se subirán todos los datos de este dispositivo a la nube. Los datos existentes en la nube para este negocio serán reemplazados.\n\n¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, respaldar",
          onPress: async () => {
            setState("uploading");
            setError("");
            setResult("");
            setProgress(null);

            const res = await uploadToCloud(
              db,
              businessId,
              deviceId,
              handleProgress,
            );

            if (res.success) {
              setState("done");
              setResult(
                `Respaldo exitoso: ${res.rowsUploaded} registros en ${res.tablesUploaded} tablas`,
              );
            } else {
              setState("error");
              setError(res.error ?? "Error desconocido");
            }
          },
        },
      ],
    );
  }, [db, businessId, deviceId, handleProgress]);

  const handleDownload = useCallback(() => {
    if (!businessId) {
      setError("No hay negocio activado");
      return;
    }

    Alert.alert(
      "⚠️ Restaurar desde la nube",
      "Se BORRARÁN todos los datos locales y se reemplazarán con los de la nube.\n\nEsta acción no se puede deshacer.\n\n¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, restaurar",
          style: "destructive",
          onPress: async () => {
            setState("downloading");
            setError("");
            setResult("");
            setProgress(null);

            // Clear current store so stale reference doesn't interfere
            setCurrentStore(null);

            const res = await downloadFromCloud(
              db,
              businessId,
              deviceId,
              handleProgress,
            );

            if (res.success) {
              await refreshStores();
              setState("done");
              setResult(
                `Restauración exitosa: ${res.rowsDownloaded} registros de ${res.tablesDownloaded} tablas`,
              );
            } else {
              setState("error");
              setError(res.error ?? "Error desconocido");
            }
          },
        },
      ],
    );
  }, [
    db,
    businessId,
    deviceId,
    handleProgress,
    refreshStores,
    setCurrentStore,
  ]);

  const isBusy =
    state === "uploading" || state === "downloading" || state === "checking";

  // Not configured
  if (available === false) {
    return (
      <ScrollView contentContainerStyle={settingStyles.profileContent}>
        <View
          style={[
            settingStyles.profileCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View style={settingStyles.cardTitleRow}>
            <CloudOff size={15} color={c.muted as any} />
            <Text style={[settingStyles.cardTitle, { color: c.text }]}>
              Sincronización en la nube
            </Text>
          </View>
          <Text style={[styles.desc, { color: c.muted }]}>
            La sincronización en la nube no está configurada para este negocio.
            Contacta al administrador del sistema para habilitar esta función.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Loading
  if (available === null) {
    return (
      <View style={settingStyles.centerBox}>
        <ActivityIndicator color={c.blue} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={settingStyles.profileContent}>
      {/* Header card */}
      <View
        style={[
          settingStyles.profileCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={settingStyles.cardTitleRow}>
          <Cloud size={15} color={c.blue as any} />
          <Text style={[settingStyles.cardTitle, { color: c.text }]}>
            Sincronización en la nube
          </Text>
        </View>
        <Text style={[styles.desc, { color: c.muted }]}>
          Respalda tus datos en la nube o restaura desde un respaldo anterior.
          Solo el administrador puede realizar estas acciones.
        </Text>

        {/* Progress */}
        {progress && isBusy && (
          <View style={[styles.progressBox, { backgroundColor: c.blueLight }]}>
            <ActivityIndicator color={c.blue} size="small" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.progressText, { color: c.blue }]}>
                {progress.message}
              </Text>
              <Text style={[styles.progressMeta, { color: c.blue }]}>
                {progress.current}/{progress.total} tablas
              </Text>
            </View>
          </View>
        )}

        {/* Result */}
        {!!result && state === "done" && (
          <View
            style={[
              settingStyles.feedbackRow,
              { backgroundColor: c.successBg },
            ]}
          >
            <CheckCircle size={16} color={c.green as any} />
            <Text style={[settingStyles.feedbackText, { color: c.green }]}>
              {result}
            </Text>
          </View>
        )}

        {/* Error */}
        {!!error && (
          <View
            style={[settingStyles.feedbackRow, { backgroundColor: c.dangerBg }]}
          >
            <AlertCircle size={16} color={c.danger as any} />
            <Text style={[settingStyles.feedbackText, { color: c.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {/* Upload */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: c.blue, opacity: isBusy ? 0.6 : 1 },
            ]}
            onPress={handleUpload}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            {state === "uploading" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ArrowUpFromLine size={18} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Respaldar en la nube</Text>
          </TouchableOpacity>

          {/* Download */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnOutline,
              {
                borderColor: c.blue,
                opacity: isBusy ? 0.6 : 1,
              },
            ]}
            onPress={handleDownload}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            {state === "downloading" ? (
              <ActivityIndicator color={c.blue} size="small" />
            ) : (
              <ArrowDownToLine size={18} color={c.blue as any} />
            )}
            <Text style={[styles.actionBtnText, { color: c.blue }]}>
              Restaurar desde la nube
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 13,
    lineHeight: 19,
  },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressMeta: {
    fontSize: 12,
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
