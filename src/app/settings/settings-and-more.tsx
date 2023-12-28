import { useMemo } from "react";
import { SectionList } from "react-native";
import { ChevronRight, Contrast, Trash2, User } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Href, router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, Text } from "tamagui";

import { VirtualizedList } from "../../components/custom-components/virtual-scroll-view";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { TouchableArea } from "../../components/touchable/touchable-area";
import { showPlayerAtom, userAtom } from "../../state/app-state";
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
import { ServerSettings } from "../../types/aba";
import { ServerConfig } from "../../types/types";

type Setting = {
  route: Href<string>;
  text: string;
  currentSetting?: string;
  icon: JSX.Element;
  subText?: string;
};

type SettingSection = {
  data: Setting[];
  subTitle: string;
};

const SettingsAndMore = () => {
  const queryClient = useQueryClient();
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const appTheme = useAtomValue(appThemeAtom);
  const setEbookSettings = useSetAtom(ebookSettignsAtom);
  const setDescOrder = useSetAtom(descOrderAtom);
  const setSort = useSetAtom(sortAtom);
  const setShowPlayer = useSetAtom(showPlayerAtom);
  const [serverSettings, setServerSettings] = useAtom(serverSettingsAtom);
  const [user, setUser] = useAtom(userAtom);
  const [currentServerConfig, setCurrentServerConfig] = useAtom(
    currentServerConfigAtom
  );

  const disconnect = async () => {
    await logout();
    setDeviceData({ ...deviceData, lastServerConnectionConfigId: null });
    setEbookSettings(DefaultSettings.ebookSettings);
    setShowPlayer({ open: false, playing: false });
    setCurrentServerConfig({} as ServerConfig);
    setServerSettings({} as ServerSettings);
    setDescOrder(false);
    setSort("");

    queryClient.clear();
    await queryClient.resetQueries();
    router.push("/server-connect/");
    setUser(null);
  };

  const logout = async () => {
    try {
      await axios.post(
        `${currentServerConfig.serverAddress}/logout`,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
    } catch (error) {
      console.log("[SETTINGS_AND_MORE] logout error ", error);
    }
  };

  const appearanceCurrentSetting = useMemo(() => {
    if (appTheme.scheme === "dark") {
      return "Dark mode";
    } else if (appTheme.scheme === "light") {
      return "Light mode";
    } else {
      return "OLED mode";
    }
  }, [appTheme]);

  const sections: SettingSection[] = [
    {
      subTitle: "App Settings",
      data: [
        {
          route: "/settings/appearence",
          text: "Appearance",
          currentSetting: appearanceCurrentSetting,
          icon: <Contrast color="$gray11" />,
        },
        {
          route: "/settings/cache",
          text: "Cache",
          icon: <Trash2 color="$gray11" />,
        },
      ],
    },
  ];

  const renderItem = ({ item }: { item: Setting }) => {
    return <SettingsRow item={item} />;
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize={"$6"}>Settings and more</Text>
      </BackHeader>
      <VirtualizedList>
        <Flex fill px="$4" pt={12}>
          <SectionList
            ListHeaderComponent={<UserSettings />}
            ItemSeparatorComponent={() => <Flex pt={8} />}
            renderItem={renderItem}
            renderSectionFooter={() => <Flex pt={24} />}
            renderSectionHeader={({ section: { subTitle } }) => (
              <Flex pb={12}>
                <Text
                  color="$gray11"
                  fontSize={18}
                  lineHeight={24}
                  fontWeight={"400"}
                >
                  {subTitle}
                </Text>
              </Flex>
            )}
            sections={sections}
          />
          <Button theme="red_active" onPress={disconnect}>
            Disconnect
          </Button>
        </Flex>
      </VirtualizedList>
      {currentServerConfig ? (
        <Flex pos={"absolute"} bottom={22} width={"100%"} px="$4">
          <Flex row fill jc={"space-between"}>
            <Text color="$gray10">{currentServerConfig.serverAddress}</Text>
            <Text color="$gray10">(v{serverSettings.version})</Text>
          </Flex>
        </Flex>
      ) : null}
    </Screen>
  );
};

const SettingsRow = ({
  item: { icon, text, subText, currentSetting, route },
}: {
  item: Setting;
}) => {
  return (
    <TouchableArea onPress={() => router.push(route)}>
      <Flex grow row alignItems="center" gap={16} minHeight={40}>
        <Flex grow row alignItems={"center"} flexBasis={0} gap={12}>
          <Flex centered height={32} width={32}>
            {icon}
          </Flex>
          <Flex fill grow alignItems="stretch">
            <Text numberOfLines={1}>{text}</Text>
            {subText && (
              <Text color="$gray11" numberOfLines={1}>
                {subText}
              </Text>
            )}
          </Flex>
        </Flex>
        <Flex centered row>
          {currentSetting ? (
            <Flex
              shrink
              row
              alignItems="flex-end"
              flexBasis="30%"
              justifyContent="flex-end"
            >
              <Text
                adjustsFontSizeToFit
                color="$gray11"
                mr={8}
                numberOfLines={1}
                lineHeight={16}
                fontWeight="400"
                fontSize={14}
              >
                {currentSetting}
              </Text>
            </Flex>
          ) : null}
          <ChevronRight color="$gray11" height={24} width={24} />
        </Flex>
      </Flex>
    </TouchableArea>
  );
};

const UserSettings = () => {
  const user = useAtomValue(userAtom);

  return (
    <Flex mb={16}>
      <Flex row justifyContent="space-between">
        <Text color="$gray11" fontSize={18} lineHeight={24} fontWeight={"400"}>
          User
        </Text>
      </Flex>
      <TouchableArea
        pl={4}
        py={12}
        onPress={() => router.push("/settings/user")}
      >
        <Flex row alignItems="center" justifyContent="space-between">
          <Flex shrink>
            {/* user */}
            <Flex row alignItems="center" gap={12}>
              <Flex centered borderRadius="$12" p={"$2"} bg="$backgroundHover">
                <User size={32} />
              </Flex>
              <Flex shrink>
                <Text numberOfLines={1} fontSize={18}>
                  {user?.username}
                </Text>
                <Text color={"$gray11"}>{user?.type}</Text>
              </Flex>
            </Flex>
          </Flex>
          <ChevronRight />
        </Flex>
      </TouchableArea>
    </Flex>
  );
};

export default SettingsAndMore;
