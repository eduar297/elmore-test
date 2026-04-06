import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, type TextInput } from "react-native";

/** Seconds without a scan before the gun is considered "disconnected". */
const GUN_DISCONNECT_MS = 30_000;

/**
 * Bluetooth HID barcode-scanner gun support.
 *
 * The gun pairs with the device as a keyboard and types the barcode followed
 * by Enter.  Render a hidden `<TextInput ref={inputRef} {...inputProps} />`
 * anywhere in the component tree to capture that input.
 *
 * Connection status is inferred from activity: after a successful scan the gun
 * is marked "connected"; after 30 s of inactivity it goes back to
 * "disconnected".
 */
export function useScannerGun({
  onScan,
}: {
  /** Called with the raw barcode string whenever the gun fires. */
  onScan: (code: string) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const bufferRef = useRef("");
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep onScan stable across renders without re-subscribing
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const resetDisconnectTimer = useCallback(() => {
    setIsConnected(true);
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    disconnectTimerRef.current = setTimeout(
      () => setIsConnected(false),
      GUN_DISCONNECT_MS,
    );
  }, []);

  const handleChangeText = useCallback((text: string) => {
    bufferRef.current = text;
  }, []);

  const handleSubmitEditing = useCallback(() => {
    const code = bufferRef.current.trim();
    bufferRef.current = "";
    inputRef.current?.clear();

    if (code.length > 0) {
      resetDisconnectTimer();
      onScanRef.current(code);
    }

    // Re-focus so the next scan is captured immediately
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [resetDisconnectTimer]);

  /** Re-focus the hidden input (call after dismissing modals / sheets). */
  const refocus = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Cleanup the disconnect timer on unmount
  useEffect(() => {
    return () => {
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    };
  }, []);

  return {
    /** Whether the gun appears connected (based on recent scan activity). */
    isConnected,
    /** Ref for the hidden TextInput — pass as `ref={inputRef}`. */
    inputRef,
    /** Re-focus the hidden input after modal / sheet dismissal. */
    refocus,
    /** Spread these on a hidden `<TextInput />`. */
    inputProps: {
      onChangeText: handleChangeText,
      onSubmitEditing: handleSubmitEditing,
      autoFocus: true,
      blurOnSubmit: false,
      caretHidden: true,
      showSoftInputOnFocus: false, // prevent virtual keyboard from appearing
      autoCapitalize: "none" as const,
      autoCorrect: false,
      autoComplete: "off" as const,
      importantForAccessibility: "no" as const,
      accessibilityElementsHidden: true,
      style: styles.hiddenInput,
    },
  };
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    opacity: 0,
  },
});
