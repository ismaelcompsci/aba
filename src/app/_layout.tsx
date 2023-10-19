import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ChevronLeft, Menu, Search } from "@tamagui/lucide-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack, usePathname } from "expo-router";
import { useAtom } from "jotai";
import { TamaguiProvider, Theme } from "tamagui";

import appConfig from "../../tamagui.config";
import { IconButton } from "../components/buttons/button";
import {
  HeaderFrame,
  HeaderLeft,
  HeaderRight,
  HeaderSafeArea,
} from "../components/header/header";
import { LogoContainer } from "../components/header/logo";
import { Logo } from "../components/logo";
import { useHeaderHeight } from "../hooks/use-header-height";
import { librariesAtom, userAtom } from "../state/app-state";
import { DefaultSettingsType } from "../state/default-state";
import { appThemeAtom, currentServerConfigAtom } from "../state/local-state";

SplashScreen.preventAutoHideAsync();

console.log(Platform.OS);

const queryClient = new QueryClient();

export default function Layout() {
  const [serverConfig] = useAtom(currentServerConfigAtom);
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);
  const [_, setLibraries] = useAtom(librariesAtom);
  const [user] = useAtom(userAtom);

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
    Appearance.addChangeListener(({ colorScheme }) => {
      const newAppTheme: DefaultSettingsType["theme"] = {
        scheme: colorScheme!,
      };
      setAppTheme(newAppTheme);
    });
  }, []);

  useEffect(() => {
    // TODO ADD LOADING STATE FOR SERVER LIST COMPONENT
    // CHANGE THIS TO TANSTACK QUERY?
    // TODO! ADD ERROR HANDLING
    const getLibraries = async () => {
      const response = await axios.get(
        `${serverConfig.serverAddress}/api/libraries`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      console.log("DONWN LULW DOW");
      setLibraries(response.data.libraries);
    };

    if (user) {
      getLibraries();
    }
  }, [user, serverConfig]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={appConfig}>
        <Theme name={appTheme.scheme}>
          <Stack
            initialRouteName="index"
            screenOptions={{
              header: Header,
              // TODO CHANGE DYNAMICALLY DEPENDING ON ROUTE
              animation: "fade",
            }}
          />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
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
