import { Appearance } from "react-native";
import { CircleOff, MoreHorizontal } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { DefaultSettings } from "../../state/default-state";
import {
  appThemeAtom,
  currentServerConfigAtom,
  descOrderAtom,
  deviceDataAtom,
  ebookSettignsAtom,
  serverSettingsAtom,
  sortAtom,
} from "../../state/local-state";
import { IconButton } from "../buttons/button";

const SettingsMenu = () => {
  const queryClient = useQueryClient();
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setCurrentServerConfig = useSetAtom(currentServerConfigAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setEbookSettings = useSetAtom(ebookSettignsAtom);
  const setDescOrder = useSetAtom(descOrderAtom);
  const setSort = useSetAtom(sortAtom);

  const isDark = appTheme.scheme === "dark";

  const disconnect = () => {
    // disconnect socket here
    setDeviceData({ ...deviceData, lastServerConnectionConfigId: null });
    setEbookSettings(DefaultSettings.ebookSettings);
    setAppTheme(DefaultSettings.theme);
    setCurrentServerConfig({});
    setServerSettings({});
    setDescOrder(false);
    setSort("");

    queryClient.clear();
    queryClient.resetQueries();
    router.push("/server-connect/");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton>
          <MoreHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem
          value={isDark} // or "off" or "mixed"
          onValueChange={() => {
            setAppTheme({ ...appTheme, scheme: isDark ? "light" : "dark" });
            Appearance.setColorScheme(isDark ? "light" : "dark");
          }}
          key="dark"
        >
          <DropdownMenu.ItemTitle>Dark mode</DropdownMenu.ItemTitle>
        </DropdownMenu.CheckboxItem>

        <DropdownMenu.Item key="disconnect" destructive onSelect={disconnect}>
          <DropdownMenu.ItemTitle>Disconnect</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{
              name: "icloud.slash.fill", // required
            }}
          >
            <CircleOff />
          </DropdownMenu.ItemIcon>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default SettingsMenu;
