import type { TabDef } from "@/components/ui/screen-tabs";
import { ScreenTabs } from "@/components/ui/screen-tabs";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserRepository } from "@/hooks/use-user-repository";
import type { User } from "@/models/user";
import { hashPin } from "@/utils/auth";
import {
    AlertCircle,
    CheckCircle,
    Edit3,
    Lock,
    Plus,
    Trash2,
    UserCog,
    Users,
} from "@tamagui/lucide-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Sheet } from "tamagui";

// ── Colors ────────────────────────────────────────────────────────────────────

function useColors(isDark: boolean) {
  return {
    bg: isDark ? "#151718" : "#f8fafc",
    card: isDark ? "#1c1c1e" : "#ffffff",
    text: isDark ? "#f2f2f7" : "#18181b",
    muted: isDark ? "#8e8e93" : "#6b7280",
    border: isDark ? "#38383a" : "#e5e7eb",
    input: isDark ? "#2c2c2e" : "#f3f4f6",
    blue: "#3b82f6",
    blueLight: isDark ? "#1e3a5f" : "#dbeafe",
    green: "#22c55e",
    greenLight: isDark ? "#14532d" : "#dcfce7",
    danger: "#ef4444",
    dangerBg: isDark ? "#2d1515" : "#fef2f2",
    successBg: isDark ? "#14290f" : "#f0fdf4",
    rowBg: isDark ? "#1c1c1e" : "#ffffff",
    divider: isDark ? "#2c2c2e" : "#f1f5f9",
    editBg: isDark ? "#2c2c2e" : "#f1f5f9",
  };
}

type Colors = ReturnType<typeof useColors>;
type TeamTab = "workers" | "profile";

// ── Workers section ───────────────────────────────────────────────────────────

function WorkersSection({ isDark, c }: { isDark: boolean; c: Colors }) {
  const userRepo = useUserRepository();
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const themeName = isDark ? "dark" : "light";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setWorkers(await userRepo.findByRole("WORKER"));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userRepo]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (sheetOpen) {
      setName(editing?.name ?? "");
      setPin("");
      setPinConfirm("");
      setFormError("");
    }
  }, [sheetOpen, editing]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);
  const openEdit = useCallback((w: User) => {
    setEditing(w);
    setSheetOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    const trimName = name.trim();
    if (!trimName) {
      setFormError("El nombre es obligatorio");
      return;
    }
    if (!editing && !pin) {
      setFormError("El PIN es obligatorio");
      return;
    }
    if (pin && pin.length < 4) {
      setFormError("El PIN debe tener al menos 4 dígitos");
      return;
    }
    if (pin && pin !== pinConfirm) {
      setFormError("Los PIN no coinciden");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const updates: { name: string; pinHash?: string } = { name: trimName };
        if (pin) updates.pinHash = await hashPin(pin);
        await userRepo.update(editing.id, updates);
      } else {
        await userRepo.create({
          name: trimName,
          role: "WORKER",
          pinHash: await hashPin(pin),
        });
      }
      setSheetOpen(false);
      load();
    } catch (e) {
      setFormError((e as Error).message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [name, pin, pinConfirm, editing, userRepo, load]);

  const handleDelete = useCallback(
    (w: User) => {
      Alert.alert(
        "Eliminar vendedor",
        `¿Eliminar a "${w.name}"? Esta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              await userRepo.delete(w.id);
              load();
            },
          },
        ],
      );
    },
    [userRepo, load],
  );

  return (
    <View style={styles.sectionRoot}>
      {/* Action bar */}
      <View style={[styles.actionBar, { borderBottomColor: c.border }]}>
        <Text style={[styles.statsText, { color: c.muted }]}>
          {workers.length} vendedor{workers.length !== 1 ? "es" : ""}
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.green }]}
          onPress={openCreate}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={c.green} size="large" />
          </View>
        ) : workers.length === 0 ? (
          <View style={styles.centerBox}>
            <View style={[styles.emptyIcon, { backgroundColor: c.greenLight }]}>
              <Users size={34} color={c.green as any} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              Sin vendedores
            </Text>
            <Text style={[styles.emptyDesc, { color: c.muted }]}>
              Añade vendedores para que puedan acceder al panel de ventas.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.listCard,
              { backgroundColor: c.rowBg, borderColor: c.border },
            ]}
          >
            {workers.map((w, idx) => (
              <View key={w.id}>
                {idx > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: c.divider }]}
                  />
                )}
                <View style={styles.workerRow}>
                  <View
                    style={[styles.avatar, { backgroundColor: c.greenLight }]}
                  >
                    <Text style={[styles.avatarText, { color: c.green }]}>
                      {w.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.workerInfo}>
                    <Text style={[styles.workerName, { color: c.text }]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.workerMeta, { color: c.muted }]}>
                      Vendedor · PIN configurado
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={[styles.iconBtn, { backgroundColor: c.editBg }]}
                      onPress={() => openEdit(w)}
                      activeOpacity={0.7}
                    >
                      <Edit3 size={15} color={c.muted as any} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconBtn, { backgroundColor: c.dangerBg }]}
                      onPress={() => handleDelete(w)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color={c.danger as any} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Worker form Sheet ──────────────────────────────────────────── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(v: boolean) => {
          if (!v) setSheetOpen(false);
        }}
        modal
        snapPoints={[72]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.5)"
        />
        <Sheet.Frame bg="$background" theme={themeName as any}>
          <Sheet.Handle />
          <Sheet.ScrollView
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            <View style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: c.text }]}>
              {editing ? "Editar vendedor" : "Nuevo vendedor"}
            </Text>

            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: c.muted }]}>
                Nombre
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
                placeholder="Nombre del vendedor"
                placeholderTextColor={c.muted}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setFormError("");
                }}
                autoCapitalize="words"
                returnKeyType="next"
                autoFocus={!editing}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: c.muted }]}>
                {editing ? "Nuevo PIN (dejar vacío para no cambiar)" : "PIN"}
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
                value={pin}
                onChangeText={(v) => {
                  setPin(v);
                  setFormError("");
                }}
                secureTextEntry
                keyboardType="numeric"
                maxLength={8}
                returnKeyType={pin.length > 0 ? "next" : "done"}
              />
            </View>

            {pin.length > 0 && (
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: c.muted }]}>
                  Confirmar PIN
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
                  value={pinConfirm}
                  onChangeText={(v) => {
                    setPinConfirm(v);
                    setFormError("");
                  }}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={8}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            )}

            {!!formError && (
              <View
                style={[styles.feedbackRow, { backgroundColor: c.dangerBg }]}
              >
                <AlertCircle size={15} color={c.danger as any} />
                <Text style={[styles.feedbackText, { color: c.danger }]}>
                  {formError}
                </Text>
              </View>
            )}

            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={[styles.btnOutline, { borderColor: c.border }]}
                onPress={() => setSheetOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnOutlineText, { color: c.muted }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnSolid,
                  { backgroundColor: c.green, opacity: saving ? 0.7 : 1 },
                ]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnSolidText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
}

// ── Profile section ───────────────────────────────────────────────────────────

function ProfileSection({ isDark, c }: { isDark: boolean; c: Colors }) {
  const { user } = useAuth();
  const userRepo = useUserRepository();

  const [name, setName] = useState(user?.name ?? "");
  const [curPin, setCurPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confPin, setConfPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const clearFeedback = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

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
    <ScrollView
      contentContainerStyle={styles.profileContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View style={styles.profileAvatarRow}>
        <View style={[styles.avatarLarge, { backgroundColor: c.blueLight }]}>
          <UserCog size={34} color={c.blue as any} />
        </View>
        <Text style={[styles.profileName, { color: c.text }]}>
          {user?.name ?? "—"}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: c.blueLight }]}>
          <Text style={[styles.roleText, { color: c.blue }]}>
            Administrador
          </Text>
        </View>
      </View>

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
          <Text style={[styles.cardTitle, { color: c.text }]}>Cambiar PIN</Text>
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
          />
        </View>

        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: c.muted }]}>Nuevo PIN</Text>
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
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnSolidText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

const TABS: TabDef<TeamTab>[] = [
  { key: "workers", label: "Vendedores", Icon: Users },
  { key: "profile", label: "Mi Perfil", Icon: UserCog },
];

export default function TeamScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = useColors(isDark);
  const [activeTab, setActiveTab] = useState<TeamTab>("workers");

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScreenTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {activeTab === "workers" ? (
        <WorkersSection isDark={isDark} c={c} />
      ) : (
        <ProfileSection isDark={isDark} c={c} />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Workers
  sectionRoot: { flex: 1 },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsText: { fontSize: 13 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  listContent: { padding: 16, flexGrow: 1 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  listCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700" },
  workerInfo: { flex: 1, gap: 2 },
  workerName: { fontSize: 15, fontWeight: "600" },
  workerMeta: { fontSize: 12 },
  rowActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sheet form
  sheetContent: { padding: 20, gap: 16, paddingBottom: 36 },
  sheetTitle: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  sheetBtns: { flexDirection: "row", gap: 10, marginTop: 4 },

  // Profile
  profileContent: { padding: 16, gap: 14, paddingBottom: 44 },
  profileAvatarRow: { alignItems: "center", gap: 8, paddingVertical: 12 },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  profileName: { fontSize: 20, fontWeight: "700" },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 13, fontWeight: "600" },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: "600" },

  // Shared
  formField: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  feedbackText: { fontSize: 13, flex: 1 },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  btnOutlineText: { fontSize: 15, fontWeight: "600" },
  btnSolid: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSolidFull: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSolidText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
