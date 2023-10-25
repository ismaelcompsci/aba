import React, { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import {
  Button,
  Label,
  Separator,
  styled,
  Switch,
  Text,
  View,
  XStack,
  YGroup,
} from "tamagui";

import { openModalAtom } from "../../state/app-state";
import { DefaultSettingsType } from "../../state/default-state";
import { appThemeAtom, deviceDataAtom } from "../../state/local-state";

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
  const setOpen = useSetAtom(openModalAtom);
  const [theme, setTheme] = useAtom(appThemeAtom);
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);

  const [checked, setChecked] = useState(theme.scheme === "dark");
  const scheme = checked ? "dark" : "light";

  const disconnect = () => {
    // disconnect socket here
    setDeviceData({ ...deviceData, lastServerConnectionConfigId: null });
    router.push("/server-connect/");
    setOpen(false);
  };

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
    <View height="100%" w="100%" p="$3" pb="$6" justifyContent="space-between">
      <YGroup separator={<Separator />}>
        <GroupItem>
          <Label>Dark mode</Label>
          <Switch checked={checked} onCheckedChange={setChecked}>
            <Switch.Thumb animation="quick" />
          </Switch>
        </GroupItem>
        <GroupItem>
          <Label>Theme color</Label>
          <SelectColor />
        </GroupItem>
      </YGroup>
      <Button theme="red_active" onPress={disconnect}>
        <Text>Disconnect</Text>
      </Button>
    </View>
  );
};

export default SettingsTab;
