import { useEffect } from "react";
import { Platform } from "react-native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ChevronLeft, MoreHorizontal, Search } from "@tamagui/lucide-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { TamaguiProvider, Theme, ThemeName } from "tamagui";

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
import MenuDrawer from "../components/menu/menu-drawer";
import { ServerSelect } from "../components/servers-popover";
import { useHeaderHeight } from "../hooks/use-header-height";
import useIconTheme from "../hooks/use-icon-theme";
import { librariesAtom, openModalAtom, userAtom } from "../state/app-state";
import { appThemeAtom, currentServerConfigAtom } from "../state/local-state";

SplashScreen.preventAutoHideAsync();

console.log(Platform.OS);

const queryClient = new QueryClient();

export default function Layout() {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const appTheme = useAtomValue(appThemeAtom);
  const setLibraries = useSetAtom(librariesAtom);

  // const pathname = usePathname();
  // const animation = pathname === "/" ? "fade" : "default";

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
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setLibraries(response.data.libraries);
    };

    if (user) {
      getLibraries();
    }
  }, [user, serverConfig]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={appConfig}>
      <Theme
        name={(appTheme.full ? appTheme.full : appTheme.scheme) as ThemeName}
      >
        <QueryClientProvider client={queryClient}>
          <MenuDrawer />
          <Stack
            initialRouteName="index"
            screenOptions={{
              header: Header,
              // TODO CHANGE DYNAMICALLY DEPENDING ON ROUTE
              animation: "fade",
            }}
          />
        </QueryClientProvider>
      </Theme>
    </TamaguiProvider>
  );
}

const Header = ({ navigation, route }: NativeStackHeaderProps) => {
  const setOpen = useSetAtom(openModalAtom);

  const { headerHeight, top } = useHeaderHeight();
  const { iconColor } = useIconTheme();
  const { name } = route;

  const showLogo =
    name === "library/index" ||
    name === "index" ||
    name === "server-connect/index";

  console.log({ name });

  const isIndex = name === "index";
  const showServerSwitch = name !== "server-connect/index";

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !showLogo });
  }, [showLogo]);

  if (name === "test/index" || name === "book/[id]") {
    return null;
  }

  return (
    <HeaderSafeArea h={headerHeight}>
      <HeaderFrame pt={top}>
        <HeaderLeft>
          {showLogo ? (
            <LogoContainer>
              <Logo />
            </LogoContainer>
          ) : (
            <LogoContainer onPress={handleBack}>
              <ChevronLeft />
            </LogoContainer>
          )}
          {showServerSwitch && !isIndex && <ServerSelect placement="bottom" />}
        </HeaderLeft>
        <HeaderRight>
          <IconButton onPress={() => router.push("/test/")}>
            <Search color={iconColor} />
          </IconButton>
          <IconButton onPress={() => setOpen((prev) => !prev)}>
            <MoreHorizontal color={iconColor} />
          </IconButton>
        </HeaderRight>
      </HeaderFrame>
    </HeaderSafeArea>
  );
};
