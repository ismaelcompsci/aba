import { useEffect, useState } from "react";
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
import { H6, Label, Separator, Switch, Text, XGroup, XStack } from "tamagui";

import {
  HEADER_HEIGHT,
  useHeaderHeight,
} from "../../../hooks/use-header-height";
import useIconTheme from "../../../hooks/use-icon-theme";
import { ebookSettignsAtom } from "../../../state/local-state";
import { ClearIconButton } from "../../buttons/button";
import { HeaderFrame, HeaderLeft, HeaderRight } from "../../header/header";
import { LogoContainer } from "../../header/logo";
import { useReader } from "../rn-epub-reader";

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

  const onLineSpaceChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      lineHeight: Math.max(0, readerSettings.lineHeight + step),
    });
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
      {hide && (
        <Header key="header" bbw={0.25} bbc={color} zIndex={8888}>
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
                        readerSettings.theme === theme.name
                          ? "$blue10"
                          : undefined
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
                <XStack alignItems="center" space="$2">
                  <Label
                    paddingRight="$0"
                    minWidth={90}
                    justifyContent="flex-end"
                  >
                    Scrolling View
                  </Label>
                  <Text fontSize={8}>(beta)</Text>
                  <Separator minHeight={20} vertical pl={"$4"} />
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
                  <XGroupButton
                    onPress={() => onLineSpaceChange(-LINESTEP)}
                    icon={ChevronsDownUp}
                    px={16.5}
                  />
                  <XGroupButton
                    onPress={() => onLineSpaceChange(LINESTEP)}
                    icon={ChevronsUpDown}
                    px={16.5}
                  />
                </XGroup>
              </XStack>
            </MenuContainer>
          ) : null}
        </Header>
      )}

      {children}

      {hide && <Footer key="footer" btw={0.25} btc={color}></Footer>}
    </>
  );
};

export default Menu;
