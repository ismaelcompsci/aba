import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ChevronLeft, Library, Search, Settings } from "@tamagui/lucide-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { TamaguiProvider, Theme, ThemeName } from "tamagui";

import appConfig from "../../tamagui.config";
import AudioPlayerContainer from "../components/audio-player/audio-player";
import { ClearIconButton, IconButton } from "../components/buttons/button";
import {
  HeaderFrame,
  HeaderLeft,
  HeaderRight,
  HeaderSafeArea,
} from "../components/header/header";
import SettingsMenu from "../components/menus/settings-menu";
import AndroidServerSelect from "../components/server-selects/server-select.android";
import { ServerSelect } from "../components/server-selects/servers-select.ios";
import { useAppSafeAreas } from "../hooks/use-app-safe-areas";
import useIconTheme from "../hooks/use-icon-theme";
import { librariesAtom, userAtom } from "../state/app-state";
import { appThemeAtom, currentServerConfigAtom } from "../state/local-state";

SplashScreen.preventAutoHideAsync();

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

  const animation = Platform.OS === "ios" ? "fade" : "default";

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={appConfig}>
        <Theme
          name={(appTheme.full ? appTheme.full : appTheme.scheme) as ThemeName}
        >
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
  const { iconColor } = useIconTheme();
  const { name } = route;

  const showLogo =
    name === "library/index" ||
    name === "index" ||
    name === "server-connect/index";
  const showSearch = name === "library/index";
  const isIndex = name === "index";
  const showServerSwitch = name === "library/index";
  const showSettings = name === "library/index";

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !showLogo });
  }, [showLogo]);

  if (
    name === "test/index" ||
    name === "book/[id]" ||
    name === "reader/[id]" ||
    name === "settings"
  ) {
    return null;
  }

  const getServerSelect = () => {
    if (Platform.OS === "android") {
      return <AndroidServerSelect />;
    } else {
      return <ServerSelect placement="bottom-end" />;
    }
  };

  return (
    <HeaderSafeArea h={headerHeight}>
      <HeaderFrame pt={top}>
        <HeaderLeft ai={"center"}>
          {showLogo ? (
            <ClearIconButton>
              <Library />
            </ClearIconButton>
          ) : (
            <ClearIconButton p={0} onPress={handleBack}>
              <ChevronLeft />
            </ClearIconButton>
          )}
          {showServerSwitch && !isIndex && getServerSelect()}
        </HeaderLeft>
        <HeaderRight>
          {showSearch ? (
            <IconButton onPress={() => router.push("/search/")}>
              <Search color={iconColor} />
            </IconButton>
          ) : null}
          {/* <SettingsMenu /> */}
          {showSettings ? (
            <IconButton onPress={() => router.push("/settings/all-settings")}>
              <Settings />
            </IconButton>
          ) : null}
        </HeaderRight>
      </HeaderFrame>
    </HeaderSafeArea>
  );
};
