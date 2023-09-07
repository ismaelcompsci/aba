import "@tamagui/core/reset.css";

import "expo-dev-client";
import { useFonts } from "expo-font";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { SplashScreen, Stack, usePathname } from "expo-router";
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
import { BookPlus, Menu } from "@tamagui/lucide-icons";

import appConfig from "../tamagui.config";
import { Toast } from "../components/toast";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
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
    <TamaguiProvider defaultTheme={theme ? theme : "dark"} config={appConfig}>
      <ToastProvider>
        <Stack initialRouteName="home" screenOptions={{ header: Header }}>
          <Stack.Screen name="home" />
        </Stack>
        <ToastViewport
          w={"100%"}
          pt={"$6"}
          display="flex"
          alignContent="center"
        />
      </ToastProvider>
    </TamaguiProvider>
  );
}

const Header = () => {
  const path = usePathname();
  const theme = Appearance.getColorScheme();

  useEffect(() => {
    console.log(theme);
  }, [theme]);

  let route = "/";

  if (path === "/") {
    route = "Login";
    return null;
  }

  if (path === "/home") {
    route = "Library";
  }

  return (
    <TStack height={"$7"} bg={"$background"} pos={"relative"} w={"100%"}>
      <XStack
        alignItems="center"
        px={"$2"}
        pos={"absolute"}
        justifyContent="space-between"
        bottom={4}
        w={"100%"}
      >
        <Button
          size={"$2"}
          icon={<Menu size={"$1"} />}
          onPress={() => {
            Appearance.setColorScheme(theme === "dark" ? "light" : "dark");
          }}
        />
        <Text fontSize={"$9"} fontWeight={"600"}>
          {route}
        </Text>
        <Button
          size={"$2"}
          icon={<BookPlus size={"$1"} />}
          onPress={() => {}}
        />
      </XStack>
    </TStack>
  );
};
