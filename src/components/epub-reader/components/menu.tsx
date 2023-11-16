import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
import {
  ChevronLeft,
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
  Fullscreen,
  List,
  Settings2,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import {
  Button,
  H6,
  Label,
  Separator,
  Switch,
  Text,
  XGroup,
  XStack,
} from "tamagui";

import {
  HEADER_HEIGHT,
  useHeaderHeight,
} from "../../../hooks/use-header-height";
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

const SCROLL_ENABLED = false;

const Menu = ({
  hide,
  title,
  setEpubReaderOverviewModal,
}: {
  hide: boolean;
  title: string;
  setEpubReaderOverviewModal: (open: boolean) => void;
}) => {
  const { height } = useWindowDimensions();
  const { changeTheme, isPdf } = useReader();

  const { top } = useHeaderHeight();

  const [openSettings, setOpenSettings] = useState(false);
  const [readerSettings, setReaderSettigns] = useAtom(ebookSettignsAtom);

  const [audioplayerMode, setAudioplayerMode] = useState(
    readerSettings.maxBlockSize !== height
  );

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

  const onBlockSizeChange = () => {
    const size = height - 120 * 2 - 30;
    if (readerSettings.maxBlockSize === size) {
      setReaderSettigns({
        ...readerSettings,
        maxBlockSize: height,
      });
      setAudioplayerMode(false);
    } else {
      setReaderSettigns({
        ...readerSettings,
        maxBlockSize: size,
      });
      setAudioplayerMode(true);
    }
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
        <Header>
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
              <ClearIconButton onPress={() => setEpubReaderOverviewModal(true)}>
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
                {!isPdf ? (
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
                ) : null}
              </XStack>
              {/* Scroll & gap  */}
              <XStack justifyContent="space-between">
                <XStack alignItems="center" space="$2">
                  {Platform.OS === "ios" && SCROLL_ENABLED ? (
                    <>
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
                    </>
                  ) : null}
                </XStack>
                {!isPdf ? (
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
                ) : null}
              </XStack>
              {/* line space */}
              {!isPdf ? (
                <XStack justifyContent="space-between">
                  <XStack ai="center" space="$4">
                    <Text>AudioPlayer mode</Text>
                    <Button
                      onPress={onBlockSizeChange}
                      borderColor={audioplayerMode ? "$blue10" : undefined}
                    >
                      <Fullscreen />
                    </Button>
                  </XStack>
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
              ) : null}

              <XStack></XStack>
            </MenuContainer>
          ) : null}
        </Header>
      )}

      {hide && <Footer></Footer>}
    </>
  );
};

export default Menu;
