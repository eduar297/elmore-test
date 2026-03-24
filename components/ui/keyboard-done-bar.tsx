import {
    InputAccessoryView,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Shared nativeID to use as `inputAccessoryViewID` on every numeric / decimal-pad
 * Input that should show the "Listo" dismiss bar.
 */
export const KEYBOARD_DONE_ID = "keyboard-done-bar";

/**
 * iOS-only toolbar rendered above the keyboard with a "Listo" button.
 * On Android the component renders nothing — Android keyboards always have
 * a dismiss affordance already.
 *
 * Usage:
 *   1. Place <KeyboardDoneBar /> anywhere inside the component that owns the input.
 *   2. Add inputAccessoryViewID={KEYBOARD_DONE_ID} to every numeric Input.
 */
export function KeyboardDoneBar() {
  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View style={styles.bar}>
        <TouchableOpacity
          onPress={Keyboard.dismiss}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          style={styles.btn}
        >
          <Text style={styles.label}>Listo</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#f1f3f5",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#c8c8c8",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btn: {
    paddingHorizontal: 4,
  },
  label: {
    color: "#007aff",
    fontSize: 17,
    fontWeight: "600",
  },
});
