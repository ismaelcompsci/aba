import { useEffect } from "react";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ChevronLeft, Menu, Search } from "@tamagui/lucide-icons";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, TamaguiProvider, Theme } from "tamagui";

import { Logo } from "../../assets/logo";
import appConfig from "../../tamagui.config";
import { IconButton } from "../components/button/button";
import {
  HeaderFrame,
  HeaderLeft,
  HeaderRight,
  HeaderSafeArea,
} from "../components/header/header";
import { LogoContainer } from "../components/header/logo";
import { useHeaderHeight } from "../hooks/use-header-height";
import { appThemeAtom, attemptingConnectionAtom } from "../state/app-state";
import { awaitTimeout } from "../utils/utils";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const appTheme = useAtomValue(appThemeAtom);
  const setAttemptingConnection = useSetAtom(attemptingConnectionAtom);

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
    const at = async () => {
      setAttemptingConnection(true);
      await awaitTimeout(3000);
      setAttemptingConnection(false);
    };

    at();
  }, []);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={appConfig}>
      <Theme name={appTheme}>
        <Stack
          initialRouteName="index"
          screenOptions={{
            header: Header,
          }}
        ></Stack>
      </Theme>
    </TamaguiProvider>
  );
}

const Header = ({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) => {
  const { headerHeight, top } = useHeaderHeight();
  const setAppTheme = useSetAtom(appThemeAtom);

  const { name } = route;

  const handlePress = () => {
    setAppTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <HeaderSafeArea h={headerHeight}>
      <HeaderFrame pt={top}>
        <HeaderLeft>
          {name === "index" ? (
            <LogoContainer>
              <Logo />
            </LogoContainer>
          ) : (
            <Button onPress={handleBack}>
              <ChevronLeft />
            </Button>
          )}
        </HeaderLeft>
        <HeaderRight>
          <IconButton>
            <Search />
          </IconButton>
          <IconButton onPress={handlePress}>
            <Menu />
          </IconButton>
        </HeaderRight>
      </HeaderFrame>
    </HeaderSafeArea>
  );
};
