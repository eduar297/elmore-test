import { Search, X } from "@tamagui/lucide-icons";
import { Button, Input, XStack } from "tamagui";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar…",
}: SearchInputProps) {
  return (
    <XStack gap="$2" style={{ alignItems: "center" }}>
      <XStack
        flex={1}
        bg="$color3"
        borderWidth={1}
        borderColor="$borderColor"
        style={{ borderRadius: 12, alignItems: "center" }}
        px="$3"
        gap="$2"
        height={44}
      >
        <Search size={18} color="$color10" />
        <Input
          flex={1}
          size="$3"
          bg="transparent"
          borderWidth={0}
          color="$color"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="$color8"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Button
            size="$2"
            chromeless
            circular
            icon={<X size={14} color="$color10" />}
            onPress={() => onChangeText("")}
          />
        )}
      </XStack>
    </XStack>
  );
}
