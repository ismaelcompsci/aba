import "@tamagui/core/reset.css";

import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import "expo-dev-client";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Stack as TStack, TamaguiProvider, Text, XStack } from "tamagui";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ChevronLeft, Menu, Search } from "@tamagui/lucide-icons";

import { useAtom, useAtomValue, useSetAtom } from "jotai/react";
import { getLibraries } from "../api/library";
import { Logo } from "../assets/svgs/logo";
import ServersModal from "../components/modals/servers-modal";
import { IconButton } from "../components/ui/button";
import { iconMap } from "../constants/adbs-icons";
import appConfig from "../tamagui.config";
import {
  currentLibraryAtom,
  currentUserAtom,
  librariesAtom,
  serversModalVisibleAtom,
} from "../utils/atoms";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [user] = useAtom(currentUserAtom);
  const [libraries, setLibraries] = useAtom(librariesAtom);
  const [theme, setTheme] = useState<ColorSchemeName>(null);
  const [loaded, error] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
    monospace: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Lato: require("../assets/fonts/Lato.ttf"),
    ...FontAwesome.font,
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
    Appearance.addChangeListener((q) => {
      setTheme(q.colorScheme);
    });
  }, []);

  useEffect(() => {
    async function initLibraries() {
      if (!user || !user?.token) {
        console.info("[INIT_LIBRARRIES_LAYOUT] no user");
        return;
      }
      const { error, data } = await getLibraries();

      if (error) {
        console.error("[INIT_LIBRARRIES_LAYOUT] ", error);
      }

      setLibraries(data?.libraries || []);

      data?.libraries && console.info("[INIT_LIBRARRIES_LAYOUT] success");
    }
    initLibraries();
  }, [user]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider defaultTheme={theme ? theme : "dark"} config={appConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider native={"mobile"}>
          <Stack
            screenOptions={{
              header: Header,
              animation: "none",
              gestureEnabled: false,
            }}
          />
          {/* TODO FIX make absolute and only take up space needed */}
          <ToastViewport
            w={"100%"}
            pt={"$8"}
            display="flex"
            alignContent="center"
          />
          <ServersModal />
        </ToastProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
const Header = ({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) => {
  const setVisible = useSetAtom(serversModalVisibleAtom);
  const lib = useAtomValue(currentLibraryAtom);

  const router = useRouter();
  const path = usePathname();
  const theme = Appearance.getColorScheme();

  const Icon = lib?.icon ? iconMap[lib.icon] : iconMap["database"];

  if (path === "/") {
    return null;
  }

  if (path.startsWith("/reader")) {
    return null;
  }

  return (
    <TStack height={"$9"} bg={"$background"} pos={"relative"} w={"100%"}>
      <XStack
        pos={"absolute"}
        w={"100%"}
        px={"$2"}
        bottom={4}
        alignItems="center"
      >
        <XStack w={"50%"}>
          {path.startsWith("/item/") ? (
            <IconButton
              mr={"$3"}
              icon={<ChevronLeft size={"$1"} color={"$blue10Dark"} />}
              onPress={() => router.back()}
            />
          ) : (
            <XStack
              pl={"$2"}
              mr={"$3"}
              alignItems="center"
              justifyContent="center"
            >
              <Logo size={"$2"} />
            </XStack>
          )}
          <XStack>
            <IconButton
              onPress={() => setVisible(true)}
              borderColor={"$blue10Dark"}
              pressStyle={{
                bg: "$backgroundPress",
              }}
              icon={<Icon size={"$1"} color={"$blue10Dark"} />}
              justifyContent="center"
              space={"$1"}
            >
              <Text
                color={"$colorPress"}
                fontWeight={"$7"}
                numberOfLines={1}
                textAlign="center"
              >
                {lib?.name || ""}
              </Text>
            </IconButton>
          </XStack>
        </XStack>
        <XStack w={"50%"} space={"$space.2"} justifyContent="flex-end">
          <IconButton
            icon={<Search size={"$1"} color={"$blue10Dark"} />}
            onPress={() => {
              Appearance.setColorScheme(theme === "dark" ? "light" : "dark");
            }}
          />
          <IconButton
            icon={<Menu size={"$1"} color={"$blue10Dark"} />}
            onPress={() => {
              Appearance.setColorScheme(theme === "dark" ? "light" : "dark");
            }}
          />
        </XStack>
      </XStack>
    </TStack>
  );
};
