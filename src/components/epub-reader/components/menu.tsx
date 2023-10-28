import { memo, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import {
  ChevronLeft,
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
  List,
  Settings2,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import {
  AnimatePresence,
  H6,
  Label,
  Separator,
  Switch,
  XGroup,
  XStack,
  XStackProps,
} from "tamagui";

import {
  HEADER_HEIGHT,
  useHeaderHeight,
} from "../../../hooks/use-header-height";
import useIconTheme from "../../../hooks/use-icon-theme";
import { ebookSettignsAtom } from "../../../state/local-state";
import { ClearIconButton } from "../../buttons/button";
import { HeaderFrame, HeaderLeft, HeaderRight } from "../../header/header";
import { LogoContainer } from "../../header/logo";
import { Theme, useReader } from "../rn-epub-reader";

import { Footer, Header } from "./header-footer";
import { MenuContainer, ThemeButton, XGroupButton } from "./menu-items";
import { themes } from "./themes";

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const Menu = ({
  children,
  hide,
  title,
}: {
  children: React.ReactNode;
  hide: boolean;
  title: string;
}) => {
  const { changeTheme } = useReader();
  const layout = Dimensions.get("window");

  const { top } = useHeaderHeight();
  const { color } = useIconTheme();

  const [openSettings, setOpenSettings] = useState(false);
  const [readerSettings, setReaderSettigns] = useAtom(ebookSettignsAtom);

  const onThemeChange = (theme: { name: string; bg: string; fg: string }) => {
    if (theme.name === readerSettings.theme) return;
    setReaderSettigns({ ...readerSettings, theme: theme.name });
  };

  const onScrollViewChange = (checked: boolean) => {
    if (checked === readerSettings.scrolled) return;

    setReaderSettigns({ ...readerSettings, scrolled: checked });
  };

  const onFontSizeChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      fontSize: Math.max(20, readerSettings.fontSize + step),
    });
  };

  const onGapChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      gap: Math.max(0, readerSettings.gap + step),
    });
  };

  const animation: XStackProps = {
    animation: "quick",
    enterStyle: {
      opacity: 0,
    },
    exitStyle: {
      opacity: 0,
      y: -HEADER_HEIGHT,
    },
  };

  const footerAnimation = {
    ...animation,
    exitStyle: {
      opacity: 0,
      y: HEADER_HEIGHT,
    },
  };

  useEffect(() => {
    changeTheme(readerSettings);
  }, [readerSettings]);

  useEffect(() => {
    if (!hide) {
      setOpenSettings(false);
    }
  }, [hide]);

  return (
    <>
      {/* <AnimatePresence> */}
      {hide && (
        <Header
          key="header"
          // {...animation}
          bbw={0.25}
          bbc={color}
        >
          <HeaderFrame pt={top}>
            <HeaderLeft ai="center">
              <LogoContainer>
                <ClearIconButton onPress={() => router.back()}>
                  <ChevronLeft />
                </ClearIconButton>
              </LogoContainer>
              <H6
                numberOfLines={1}
                $sm={{ maxWidth: "$15" }}
                $md={{ maxWidth: "$20" }}
              >
                {title}
              </H6>
            </HeaderLeft>
            <HeaderRight>
              <ClearIconButton>
                <List />
              </ClearIconButton>
              <ClearIconButton onPress={() => setOpenSettings((p) => !p)}>
                <Settings2 />
              </ClearIconButton>
            </HeaderRight>
          </HeaderFrame>
          {openSettings ? (
            <MenuContainer t={HEADER_HEIGHT}>
              {/* theme & font size */}
              <XStack justifyContent="space-between">
                <XStack gap="$4">
                  {themes.map((theme) => (
                    <ThemeButton
                      onPress={() => onThemeChange(theme)}
                      key={theme.name}
                      bg={theme.bg}
                      color={theme.fg}
                      borderColor={
                        readerSettings.theme === theme.name ? "$blue10" : null
                      }
                    >
                      Aa
                    </ThemeButton>
                  ))}
                </XStack>
                <XGroup>
                  <XGroupButton
                    onPress={() => onFontSizeChange(-FONT_STEP)}
                    fontSize={"$1"}
                  >
                    A
                  </XGroupButton>
                  <XGroupButton
                    onPress={() => onFontSizeChange(FONT_STEP)}
                    fontSize={"$7"}
                  >
                    A
                  </XGroupButton>
                </XGroup>
              </XStack>
              {/* Scroll & gap  */}
              <XStack justifyContent="space-between">
                <XStack alignItems="center" space="$4">
                  <Label
                    paddingRight="$0"
                    minWidth={90}
                    justifyContent="flex-end"
                  >
                    Scrolling View
                  </Label>
                  <Separator minHeight={20} vertical />
                  <Switch
                    defaultChecked={readerSettings.scrolled}
                    onCheckedChange={onScrollViewChange}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>
                <XGroup>
                  <XGroupButton
                    onPress={() => onGapChange(GAPSTEP)}
                    icon={ChevronsRightLeft}
                    px={16.5}
                  />
                  <XGroupButton
                    onPress={() => onGapChange(-GAPSTEP)}
                    icon={ChevronsLeftRight}
                    px={16.5}
                  />
                </XGroup>
              </XStack>
              {/* line space */}
              <XStack justifyContent="flex-end">
                <XGroup>
                  <XGroupButton icon={ChevronsDownUp} px={16.5} />
                  <XGroupButton icon={ChevronsUpDown} px={16.5} />
                </XGroup>
              </XStack>
            </MenuContainer>
          ) : null}
        </Header>
      )}
      {/* </AnimatePresence> */}

      {children}

      {/* <AnimatePresence> */}
      {hide && (
        <Footer
          key="footer"
          btw={0.25}
          btc={color}
          // {...footerAnimation}
        ></Footer>
      )}
      {/* </AnimatePresence> */}
    </>
  );
};

export default Menu;
