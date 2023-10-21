import React, { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { useAtom } from "jotai";
import {
  Label,
  Separator,
  styled,
  Switch,
  View,
  XStack,
  YGroup,
} from "tamagui";

import { DefaultSettingsType } from "../../state/default-state";
import { appThemeAtom } from "../../state/local-state";

import { SelectColor } from "./select-color";

const GroupSection = styled(XStack, {
  px: "$2",
  justifyContent: "space-between",
  py: "$2",
  alignItems: "center",
});

const GroupItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <YGroup.Item>
      <GroupSection>{children}</GroupSection>
    </YGroup.Item>
  );
};

const SettingsTab = () => {
  const [theme, setTheme] = useAtom(appThemeAtom);

  const [checked, setChecked] = useState(theme.scheme === "dark");
  const scheme = checked ? "dark" : "light";

  useEffect(() => {
    const newAppTheme: DefaultSettingsType["theme"] = {
      scheme: scheme,
      color: theme.color,
      full:
        theme.color && theme.color !== "no color"
          ? `${scheme}_${theme.color}`
          : null,
    };

    setTheme(newAppTheme);
    Appearance.setColorScheme(scheme);
  }, [checked]);

  return (
    <View height="100%" w="100%" p="$3">
      <YGroup separator={<Separator />}>
        <GroupItem>
          <Label>Dark mode</Label>
          <Switch checked={checked} onCheckedChange={setChecked}>
            <Switch.Thumb bg="$color" animation="quick" />
          </Switch>
        </GroupItem>
        <GroupItem>
          <Label>Theme color</Label>
          <SelectColor />
        </GroupItem>
      </YGroup>
    </View>
  );
};

export default SettingsTab;
