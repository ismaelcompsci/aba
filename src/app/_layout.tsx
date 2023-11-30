import { useEffect, useMemo } from "react";
import { Appearance, Platform, UIManager } from "react-native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import {
  ChevronLeft,
  Library,
  MoreVertical,
  Search,
} from "@tamagui/lucide-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { TamaguiProvider, Theme, useTheme } from "tamagui";

import appConfig from "../../tamagui.config";
import AudioPlayerContainer from "../components/audio-player/audio-player";
import { Flex } from "../components/layout/flex";
import AndroidServerSelect from "../components/server-selects/server-select.android";
import ServerSelect from "../components/server-selects/servers-select.ios";
import { TouchableArea } from "../components/touchable/touchable-area";
import { IS_ANDROID, IS_IOS } from "../constants/consts";
import { useAppSafeAreas } from "../hooks/use-app-safe-areas";
import { librariesAtom, userAtom } from "../state/app-state";
import { appThemeAtom, currentServerConfigAtom } from "../state/local-state";

SplashScreen.preventAutoHideAsync();
if (IS_ANDROID && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const queryClient = new QueryClient();

export default function Layout() {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const appTheme = useAtomValue(appThemeAtom);
  const setLibraries = useSetAtom(librariesAtom);

  const [loaded, error] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // TODO ADD LOADING STATE FOR SERVER LIST COMPONENT
    // CHANGE THIS TO TANSTACK QUERY?
    // TODO! ADD ERROR HANDLING
    const getLibraries = async () => {
      const response = await axios.get(
        `${serverConfig.serverAddress}/api/libraries`,
        { headers: { Authorization: `Bearer ${user?.token}` }, timeout: 3000 }
      );
      setLibraries(response.data.libraries);
    };

    if (user?.id && serverConfig.serverAddress) {
      getLibraries();
    }
  }, [user, serverConfig]);

  useEffect(() => {
    Appearance.setColorScheme(appTheme.scheme);
  }, []);

  if (!loaded) return null;

  const animation = IS_IOS ? "fade" : "default";

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={appConfig} defaultTheme="system">
        <Theme name={appTheme.scheme}>
          <Stack
            initialRouteName="index"
            screenOptions={{
              header: Header,
              animation: animation,
            }}
          />
          <AudioPlayerContainer />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

const Header = ({ navigation, route }: NativeStackHeaderProps) => {
  const { headerHeight, top } = useAppSafeAreas();
  const color = useTheme();
  const { name } = route;

  const showLogo =
    name === "library/index" ||
    name === "index" ||
    name === "server-connect/index";
  const showSearch = name === "library/index";
  // const isIndex = name === "index";
  const showServerSwitch = name === "library/index";
  const showSettings = name === "library/index";

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !showLogo });
  }, [showLogo]);

  const getServerSelect = useMemo(() => {
    if (Platform.OS === "android") {
      return <AndroidServerSelect />;
    } else {
      return <ServerSelect placement="bottom-end" />;
    }
  }, []);

  if (
    name === "test/index" ||
    name === "book/[id]" ||
    name === "reader/[id]" ||
    name === "settings" ||
    name === "genres/index" ||
    name === "library/[filter]/[id]" ||
    name === "search/index"
  ) {
    return null;
  }

  return (
    <Flex bg="$background" h={headerHeight}>
      <Flex row flex={1} alignItems="center" paddingHorizontal={"$4"} pt={top}>
        <Flex row flex={1} gap="$4" ai={"center"}>
          {showLogo ? (
            <TouchableArea>
              <Library />
            </TouchableArea>
          ) : (
            <TouchableArea
              pt={16}
              hapticFeedback
              hitSlop={20}
              onPress={handleBack}
            >
              <ChevronLeft />
            </TouchableArea>
          )}
          {showServerSwitch && getServerSelect}
        </Flex>
        <Flex row alignItems="center" gap={16}>
          {showSearch ? (
            <TouchableArea
              hapticFeedback
              hitSlop={20}
              onPress={() => router.push("/search/")}
            >
              <Search color={color.color.get()} />
            </TouchableArea>
          ) : null}
          {showSettings ? (
            <TouchableArea
              hapticFeedback
              hitSlop={20}
              onPress={() => router.push("/settings/settings-and-more")}
              jc="center"
            >
              <MoreVertical size={24} />
            </TouchableArea>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
};
