import { useEffect } from "react";
import { Appearance, UIManager } from "react-native";
import TrackPlayer from "react-native-track-player";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import {
  ChevronLeft,
  Cloud,
  CloudCog,
  CloudOff,
  Library,
  MoreVertical,
  Search,
  SmartphoneNfc,
  WifiOff,
} from "@tamagui/lucide-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { ColorTokens, TamaguiProvider, Theme, useTheme } from "tamagui";

import appConfig from "../../tamagui.config";
import { Flex, FlexProps } from "../components/layout/flex";
import { AppModals } from "../components/modals/app-modals";
import ServerSelect from "../components/server-select";
import { TouchableArea } from "../components/touchable/touchable-area";
import { IS_ANDROID, IS_IOS } from "../constants/consts";
import { SocketProvider } from "../context/socket-context";
import { useAppSafeAreas } from "../hooks/use-app-safe-areas";
import {
  attemptingConnectionAtom,
  librariesAtom,
  requestInfoAtom,
  socketConnectedAtom,
} from "../state/app-state";
import { appThemeAtom } from "../state/local-state";
import { Dot } from "../components/dot";
SplashScreen.preventAutoHideAsync();

if (IS_ANDROID && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const queryClient = new QueryClient();

export default function Layout() {
  const appTheme = useAtomValue(appThemeAtom);

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
    Appearance.setColorScheme(
      appTheme.scheme === "oled" || appTheme.scheme === "dark"
        ? "dark"
        : "light"
    );
    (async () => {
      try {
        await TrackPlayer.setupPlayer();
      } catch (error) {
        console.log("[TRACKPLAYER] player already setup");
      }
    })();
  }, []);

  if (!loaded) return null;

  const animation = IS_IOS ? "fade" : "default";

  return (
    <BottomSheetModalProvider>
      <QueryClientProvider client={queryClient}>
        <DataUpdaters />
        <TamaguiProvider config={appConfig} defaultTheme="system">
          <Theme name={appTheme.scheme}>
            <SocketProvider>
              <Stack
                initialRouteName="index"
                screenOptions={{
                  header: Header,
                  animation: animation,
                }}
              />
              <AppModals />
            </SocketProvider>
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </BottomSheetModalProvider>
  );
}

const DataUpdaters = () => {
  const { serverAddress, token } = useAtomValue(requestInfoAtom);
  const setLibraries = useSetAtom(librariesAtom);

  useEffect(() => {
    const getLibraries = async () => {
      const response = await axios.get(`${serverAddress}/api/libraries`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      });
      setLibraries(response.data.libraries);
    };

    if (token && serverAddress) {
      getLibraries();
    }
  }, [token, serverAddress]);

  return null;
};

const Header = ({ navigation, route }: NativeStackHeaderProps) => {
  const { headerHeight, top, left } = useAppSafeAreas();
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

  if (
    name === "test/index" ||
    name === "book/[id]" ||
    name === "reader/[id]" ||
    name === "settings" ||
    name === "genres/index" ||
    name === "library/[filter]/[id]" ||
    name === "search/index" ||
    name === "playlists/[id]" ||
    name === "book/[bookId]/[episodeId]" ||
    name === "collection/[id]" ||
    name === "reader"
  ) {
    return null;
  }

  return (
    <Flex bg="$background" row pt={headerHeight}>
      <Flex
        row
        flex={1}
        alignItems="center"
        paddingHorizontal={16 + left / 2}
        pt={top}
      >
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
          {showServerSwitch && <ServerSelect placement="bottom" />}
          <NetworkIndicator />
        </Flex>
        <Flex row alignItems="center" gap={16}>
          {showSearch ? (
            <TouchableArea
              hapticFeedback
              hitSlop={10}
              onPress={() => router.push("/search/")}
            >
              <Search color={color.color.get()} />
            </TouchableArea>
          ) : null}
          {showSettings ? (
            <TouchableArea
              hapticFeedback
              hitSlop={10}
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

const NetworkIndicator = () => {
  const attemptingConnection = useAtomValue(attemptingConnectionAtom);
  const socketConnected = useAtomValue(socketConnectedAtom);

  const netInfo = useNetInfo();

  let Icon;

  if (attemptingConnection) {
    Icon = CloudCog;
  } else if (!netInfo.isConnected) {
    Icon = WifiOff;
  } else if (!socketConnected) {
    Icon = CloudOff;
  } else if (netInfo.type === "cellular") {
    Icon = SmartphoneNfc;
  } else Icon = Cloud;

  let color: ColorTokens;

  if (!netInfo.isConnected) {
    color = "$red10";
  } else if (!socketConnected) {
    color = "$orange10";
  } else if (netInfo.type === "cellular") {
    color = "$purple10";
  } else {
    color = "$green10";
  }
  return (
    <TouchableArea flexDirection="row" gap="$2" alignItems="center">
      <Dot bg={color} />
      <Icon size="$1" color={color} />
    </TouchableArea>
  );
};
