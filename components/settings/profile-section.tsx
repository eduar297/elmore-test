import { PhotoPicker } from "@/components/ui/photo-picker";
import { PinPromptDialog } from "@/components/ui/pin-prompt-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useStore } from "@/contexts/store-context";
import { resetDatabase, seedSimulation } from "@/database/seed-simulation";
import { useColors } from "@/hooks/use-colors";
import { useUserRepository } from "@/hooks/use-user-repository";
import { hashPin } from "@/utils/auth";
import {
    AlertCircle,
    Camera,
    CheckCircle,
    Database,
    Lock,
    Play,
    Trash2,
    TriangleAlert,
    UserCog,
} from "@tamagui/lucide-icons";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { settingStyles as styles } from "./shared";

export function ProfileSection() {
  const c = useColors();
  const { user, setUser } = useAuth();
  const userRepo = useUserRepository();
  const db = useSQLiteContext();
  const { refreshStores, setCurrentStore, currentStore } = useStore();

  const [name, setName] = useState(user?.name ?? "");
  const [photoUri, setPhotoUri] = useState<string | null>(
    user?.photoUri ?? null,
  );
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [curPin, setCurPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confPin, setConfPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState("");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinDialogMode, setPinDialogMode] = useState<"reset" | "seed" | null>(
    null,
  );

  useEffect(() => {
    setName(user?.name ?? "");
    setPhotoUri(user?.photoUri ?? null);
  }, [user]);

  const clearFeedback = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const handlePhotoChange = useCallback(
    async (uri: string | null) => {
      if (!user) return;
      setPhotoUri(uri);
      await userRepo.update(user.id, { photoUri: uri });
      setUser({ ...user, photoUri: uri });
      setShowPhotoPicker(false);
    },
    [user, userRepo, setUser],
  );

  const verifyAdminPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!user) return false;
      const valid = await userRepo.verifyPin(user.id, await hashPin(pin));
      return valid;
    },
    [user, userRepo],
  );

  const handleReset = useCallback(() => {
    setPinDialogMode("reset");
    setPinDialogOpen(true);
  }, []);

  const handleSeed = useCallback(() => {
    setPinDialogMode("seed");
    setPinDialogOpen(true);
  }, []);

  const handlePinConfirm = useCallback(
    async (pin: string) => {
      setPinDialogOpen(false);
      const valid = await verifyAdminPin(pin);
      if (!valid) {
        setError("PIN incorrecto");
        return;
      }
      if (pinDialogMode === "reset") {
        Alert.alert(
          "⚠️ Borrar base de datos",
          "Se eliminarán TODOS los datos: productos, tickets, compras, gastos, proveedores, trabajadores y fotos. Solo se conservará tu cuenta de administrador y las unidades del sistema.\n\n¿Estás completamente seguro?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Sí, borrar todo",
              style: "destructive",
              onPress: async () => {
                setResetting(true);
                setError("");
                setSuccess("");
                try {
                  await resetDatabase(db);
                  setCurrentStore(null);
                  await refreshStores();
                  setSuccess("Base de datos limpiada correctamente");
                } catch (e) {
                  setError((e as Error).message ?? "Error al limpiar");
                } finally {
                  setResetting(false);
                }
              },
            },
          ],
        );
      } else if (pinDialogMode === "seed") {
        Alert.alert(
          "Sembrar datos de prueba",
          "Se creará un año completo de datos simulados: trabajadores, productos, compras, tickets y gastos.\n\nEs recomendable limpiar la base de datos primero.\n\n¿Continuar?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Sí, sembrar datos",
              onPress: async () => {
                setSeeding(true);
                setError("");
                setSuccess("");
                setSeedProgress("Iniciando...");
                try {
                  await seedSimulation(db, currentStore!.id, (msg) =>
                    setSeedProgress(msg),
                  );
                  setSuccess("Simulación completada exitosamente");
                  setSeedProgress("");
                } catch (e) {
                  setError((e as Error).message ?? "Error al sembrar datos");
                  setSeedProgress("");
                } finally {
                  setSeeding(false);
                }
              },
            },
          ],
        );
      }
    },
    [
      verifyAdminPin,
      pinDialogMode,
      db,
      refreshStores,
      setCurrentStore,
      currentStore,
    ],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;
    const trimName = name.trim();
    if (!trimName) {
      setError("El nombre es obligatorio");
      return;
    }
    if (curPin || newPin) {
      if (!curPin) {
        setError("Ingresa tu PIN actual para cambiarlo");
        return;
      }
      if (!newPin) {
        setError("Ingresa el nuevo PIN");
        return;
      }
      if (newPin.length < 4) {
        setError("El nuevo PIN debe tener al menos 4 dígitos");
        return;
      }
      if (newPin !== confPin) {
        setError("Los PIN nuevos no coinciden");
        return;
      }
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updates: { name: string; pinHash?: string } = { name: trimName };
      if (curPin && newPin) {
        const valid = await userRepo.verifyPin(user.id, await hashPin(curPin));
        if (!valid) {
          setError("PIN actual incorrecto");
          setSaving(false);
          return;
        }
        updates.pinHash = await hashPin(newPin);
      }
      await userRepo.update(user.id, updates);
      setSuccess("Perfil actualizado correctamente");
      setCurPin("");
      setNewPin("");
      setConfPin("");
    } catch (e) {
      setError((e as Error).message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [user, name, curPin, newPin, confPin, userRepo]);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.profileContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.profileAvatarRow}>
          <TouchableOpacity
            onPress={() => setShowPhotoPicker((v) => !v)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
          >
            <View style={styles.avatarWrapper}>
              <View
                style={[styles.avatarLarge, { backgroundColor: c.blueLight }]}
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.avatarLargeImage}
                  />
                ) : (
                  <UserCog size={34} color={c.blue as any} />
                )}
              </View>
              <View
                style={[styles.avatarEditBadge, { backgroundColor: c.blue }]}
              >
                <Camera size={12} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: c.text }]}>
            {user?.name ?? "—"}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: c.blueLight }]}>
            <Text style={[styles.roleText, { color: c.blue }]}>
              Administrador
            </Text>
          </View>
        </View>

        {/* Photo picker (inline) */}
        {showPhotoPicker && (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <PhotoPicker uri={photoUri} onChange={handlePhotoChange} />
          </View>
        )}

        {/* Name */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Información personal
          </Text>
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: c.muted }]}>Nombre</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.input,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearFeedback();
              }}
              placeholder="Nombre del administrador"
              placeholderTextColor={c.muted}
              autoCapitalize="words"
              accessibilityLabel="Nombre de administrador"
            />
          </View>
        </View>

        {/* PIN change */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Lock size={14} color={c.blue as any} />
            <Text style={[styles.cardTitle, { color: c.text }]}>
              Cambiar PIN
            </Text>
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: c.muted }]}>
              PIN actual
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.input,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={c.muted}
              value={curPin}
              onChangeText={(v) => {
                setCurPin(v);
                clearFeedback();
              }}
              secureTextEntry
              keyboardType="numeric"
              maxLength={8}
              accessibilityLabel="PIN actual"
            />
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: c.muted }]}>
              Nuevo PIN
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.input,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={c.muted}
              value={newPin}
              onChangeText={(v) => {
                setNewPin(v);
                clearFeedback();
              }}
              secureTextEntry
              keyboardType="numeric"
              maxLength={8}
              accessibilityLabel="Nuevo PIN"
            />
          </View>

          {newPin.length > 0 && (
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: c.muted }]}>
                Confirmar nuevo PIN
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.input,
                    color: c.text,
                    borderColor: c.border,
                  },
                ]}
                placeholder="••••"
                placeholderTextColor={c.muted}
                value={confPin}
                onChangeText={(v) => {
                  setConfPin(v);
                  clearFeedback();
                }}
                secureTextEntry
                keyboardType="numeric"
                maxLength={8}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                accessibilityLabel="Confirmar nuevo PIN"
              />
            </View>
          )}
        </View>

        {/* Feedback */}
        {!!error && (
          <View style={[styles.feedbackRow, { backgroundColor: c.dangerBg }]}>
            <AlertCircle size={15} color={c.danger as any} />
            <Text style={[styles.feedbackText, { color: c.danger }]}>
              {error}
            </Text>
          </View>
        )}
        {!!success && (
          <View style={[styles.feedbackRow, { backgroundColor: c.successBg }]}>
            <CheckCircle size={15} color={c.green as any} />
            <Text style={[styles.feedbackText, { color: c.green }]}>
              {success}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.btnSolidFull,
            { backgroundColor: c.blue, opacity: saving ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Guardar cambios de perfil"
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnSolidText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        {/* ── Danger zone ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: c.card,
              borderColor: c.danger,
              borderWidth: 1.5,
              marginTop: 10,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <TriangleAlert size={15} color={c.danger as any} />
            <Text style={[styles.cardTitle, { color: c.danger }]}>
              Zona peligrosa
            </Text>
          </View>

          {/* Reset DB */}
          <View style={styles.dangerBlock}>
            <View style={styles.dangerInfo}>
              <View style={styles.cardTitleRow}>
                <Database size={14} color={c.danger as any} />
                <Text style={[styles.dangerLabel, { color: c.text }]}>
                  Limpiar base de datos
                </Text>
              </View>
              <Text style={[styles.dangerDesc, { color: c.muted }]}>
                Elimina todos los datos excepto tu cuenta y unidades del
                sistema.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.dangerBtn,
                { borderColor: c.danger, opacity: resetting ? 0.7 : 1 },
              ]}
              onPress={handleReset}
              disabled={resetting || seeding}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Limpiar base de datos"
            >
              {resetting ? (
                <ActivityIndicator color={c.danger} size="small" />
              ) : (
                <>
                  <Trash2 size={14} color={c.danger as any} />
                  <Text style={[styles.dangerBtnText, { color: c.danger }]}>
                    Limpiar todo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.dangerDivider, { backgroundColor: c.border }]} />

          {/* Seed simulation */}
          <View style={styles.dangerBlock}>
            <View style={styles.dangerInfo}>
              <View style={styles.cardTitleRow}>
                <Play size={14} color={c.blue as any} />
                <Text style={[styles.dangerLabel, { color: c.text }]}>
                  Sembrar datos de prueba
                </Text>
              </View>
              <Text style={[styles.dangerDesc, { color: c.muted }]}>
                Genera un año de datos simulados: 4 trabajadores, 44 productos,
                5 proveedores, compras, tickets diarios y gastos.
              </Text>
            </View>
            {!!seedProgress && (
              <View
                style={[styles.feedbackRow, { backgroundColor: c.blueLight }]}
              >
                <ActivityIndicator color={c.blue} size="small" />
                <Text style={[styles.feedbackText, { color: c.blue }]}>
                  {seedProgress}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.seedBtn,
                { backgroundColor: c.blue, opacity: seeding ? 0.7 : 1 },
              ]}
              onPress={handleSeed}
              disabled={seeding || resetting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Iniciar simulación de datos"
            >
              {seeding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Play size={14} color="#fff" />
                  <Text style={styles.btnSolidText}>Iniciar simulación</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <PinPromptDialog
        open={pinDialogOpen}
        title="🔐 Confirmar identidad"
        description={
          pinDialogMode === "reset"
            ? "Ingresa tu PIN de administrador para limpiar la base de datos"
            : "Ingresa tu PIN de administrador para sembrar datos de prueba"
        }
        onConfirm={handlePinConfirm}
        onCancel={() => setPinDialogOpen(false)}
      />
    </>
  );
}
