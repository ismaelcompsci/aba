import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ChevronLeft, Menu, Search } from "@tamagui/lucide-icons";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack, usePathname } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { TamaguiProvider, Theme } from "tamagui";

import appConfig from "../../tamagui.config";
import { IconButton } from "../components/button/button";
import {
  HeaderFrame,
  HeaderLeft,
  HeaderRight,
  HeaderSafeArea,
} from "../components/header/header";
import { LogoContainer } from "../components/header/logo";
import { Logo } from "../components/logo";
import { useHeaderHeight } from "../hooks/use-header-height";
import { attemptingConnectionAtom, userAtom } from "../state/app-state";
import { DefaultSettingsType } from "../state/default-state";
import { appThemeAtom } from "../state/local-state";
import { awaitTimeout } from "../utils/utils";

SplashScreen.preventAutoHideAsync();

console.log(Platform.OS);

export default function Layout() {
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);
  const setAttemptingConnection = useSetAtom(attemptingConnectionAtom);
  const setUser = useSetAtom(userAtom);

  const pathname = usePathname();
  const animation = pathname === "/" ? "fade" : "default";

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
      Appearance.setColorScheme(appTheme.scheme);
    }
  }, [loaded]);

  useEffect(() => {
    const at = async () => {
      setAttemptingConnection(true);
      await awaitTimeout(3000);
      // setUser(null);
      setAttemptingConnection(false);
    };

    at();
  }, []);

  useEffect(() => {
    Appearance.addChangeListener(({ colorScheme }) => {
      const newAppTheme: DefaultSettingsType["theme"] = {
        scheme: colorScheme!,
      };
      setAppTheme(newAppTheme);
    });
  }, []);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={appConfig}>
      <Theme name={appTheme.scheme}>
        <Stack
          initialRouteName="index"
          screenOptions={{
            header: Header,
            animation: animation,
          }}
        />
      </Theme>
    </TamaguiProvider>
  );
}

const Header = ({ navigation, route }: NativeStackHeaderProps) => {
  const { headerHeight, top } = useHeaderHeight();
  const { name } = route;

  const theme = Appearance.getColorScheme();

  const showLogo = name === "library/index" || name === "index";

  const handlePress = () => {
    Appearance.setColorScheme(theme === "dark" ? "light" : "dark");
  };

  const handleBack = () => {
    router.back();
  };
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !showLogo });
  }, [showLogo]);

  return (
    <HeaderSafeArea h={headerHeight}>
      <HeaderFrame pt={top}>
        <HeaderLeft>
          {showLogo ? (
            <LogoContainer>
              <Logo />
            </LogoContainer>
          ) : (
            <IconButton onPress={handleBack}>
              <ChevronLeft />
            </IconButton>
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
