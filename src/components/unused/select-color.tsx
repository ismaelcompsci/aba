import { useMemo, useState } from "react";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Adapt, Select, SelectProps, Sheet, Stack, ThemeName } from "tamagui";

import { DefaultSettingsType, ThemeNames } from "../../state/default-state";
import { appThemeAtom } from "../../state/local-state";

const items = [
  { name: "no color" },
  { name: "orange" },
  { name: "yellow" },
  { name: "green" },
  { name: "blue" },
  { name: "purple" },
  { name: "pink" },
  { name: "red" },
];

export function SelectColor(props: SelectProps) {
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);

  const [val, setVal] = useState(appTheme.color ?? "no color");

  const onValueChange = (value: ThemeNames) => {
    setVal(value);

    const newAppTheme: DefaultSettingsType["theme"] = {
      scheme: appTheme.scheme,
      color: value as ThemeName,
      full:
        value && value !== "no color" ? `${appTheme.scheme}_${value}` : null,
    };

    setAppTheme(newAppTheme);
  };

  return (
    <Select
      id="Theme Colors"
      value={val}
      onValueChange={onValueChange}
      disablePreventBodyScroll
      {...props}
    >
      <Select.Trigger width={220} iconAfter={ChevronDown}>
        <Select.Value placeholder="No color selected" />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          native
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
          snapPoints={[45]}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport minWidth={200}>
          <Select.Group>
            <Select.Label>Theme Colors</Select.Label>
            {/* for longer lists memoizing these is useful */}
            {useMemo(
              () =>
                items.map((item, i) => {
                  return (
                    <Select.Item
                      debug="verbose"
                      index={i}
                      key={item.name}
                      value={item.name.toLowerCase()}
                    >
                      <Select.ItemText
                        color={item.name === "no color" ? "$color" : item.name}
                      >
                        {item.name}
                      </Select.ItemText>

                      <Select.ItemIndicator marginLeft="auto">
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  );
                }),
              [items]
            )}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
