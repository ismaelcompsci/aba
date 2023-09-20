import "@tamagui/core/reset.css";

import "expo-dev-client";
import { useFonts } from "expo-font";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import {
  Button,
  Stack as TStack,
  TamaguiProvider,
  Text,
  XStack,
} from "tamagui";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ArrowLeft, ChevronLeft, Menu, Search } from "@tamagui/lucide-icons";

import appConfig from "../tamagui.config";
import { Provider, useAtom, useSetAtom } from "jotai/react";
import { MMKV } from "react-native-mmkv";
import { currentServerConfigAtom } from "../utils/local-atoms";
import { IconButton } from "../components/ui/button";

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

export default function RootLayout() {
  const [theme, setTheme] = useState<ColorSchemeName>(null);
  const [loaded, error] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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

  if (!loaded) {
    return null;
  }

  return (
    <Provider>
      <TamaguiProvider defaultTheme={theme ? theme : "dark"} config={appConfig}>
        <ToastProvider>
          <Stack
            screenOptions={{
              header: Header,
              animation: "none",
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="(root)/index" />
          </Stack>

          <ToastViewport
            w={"100%"}
            pt={"$8"}
            display="flex"
            alignContent="center"
          />
        </ToastProvider>
      </TamaguiProvider>
    </Provider>
  );
}
const Header = ({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) => {
  const router = useRouter();
  const path = usePathname();
  const theme = Appearance.getColorScheme();

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
          {path.startsWith("/item/") && (
            <IconButton
              icon={<ChevronLeft size={"$1"} color={"$blue10Dark"} />}
              onPress={() => router.back()}
            />
          )}
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
        {/* <Text px={20} fontSize={"$9"} fontWeight={"600"}>
          {route}
        </Text> */}
      </XStack>
    </TStack>
  );
};
