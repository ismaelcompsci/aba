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
  Pause,
  Play,
  Settings2,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { atom, useAtom } from "jotai";
import { Button, H6, Label, Separator, Switch, Text, XGroup } from "tamagui";

import {
  HEADER_HEIGHT,
  useAppSafeAreas,
} from "../../../hooks/use-app-safe-areas";
import useIconTheme from "../../../hooks/use-icon-theme";
import { ebookSettignsAtom } from "../../../state/local-state";
import { ClearIconButton } from "../../buttons/button";
import { HeaderFrame, HeaderLeft, HeaderRight } from "../../header/header";
import { LogoContainer } from "../../header/logo";
import { Flex } from "../../layout/flex";
import useTTS from "../hooks/use-tts";
import { Theme, useReader } from "../rn-epub-reader";

import { Footer, Header } from "./header-footer";
import { MenuContainer, ThemeButton, XGroupButton } from "./menu-items";
import { themes } from "./themes";
import TTSVoiceModal from "./tts-voice-modal";
const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const SCROLL_ENABLED = false;

const def = {
  tts: false,
  voice: "",
};
type GeneralEpubReaderSettings = {
  tts: boolean;
  voice: string;
};
const generalEpubReaderSettingsAtom = atom<GeneralEpubReaderSettings>(def);

const Menu = ({
  hide,
  title,
  setEpubReaderOverviewModal,
}: {
  hide: boolean;
  title: string;
  setEpubReaderOverviewModal: (open: boolean) => void;
}) => {
  const {
    pause,
    resume,
    inProgress,
    paused,
    stop,
    voiceList,
    voice,
    setVoice,
  } = useTTS();

  const { height, width } = useWindowDimensions();
  const { changeTheme, isPdf } = useReader();
  const { color } = useIconTheme();

  const { top } = useAppSafeAreas();

  const [openSettings, setOpenSettings] = useState(false);
  const [readerSettings, setReaderSettigns] = useAtom(ebookSettignsAtom);
  const [generalEpubReaderSettings, setGeneralEpubReaderSettings] = useAtom(
    generalEpubReaderSettingsAtom
  );

  const [audioplayerMode, setAudioplayerMode] = useState(
    readerSettings.maxBlockSize !== height
  );
  const [voicesModalOpen, setVoicesModalOpen] = useState(false);

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

  useEffect(() => {
    setReaderSettigns((prev: Theme) => ({ ...prev, maxInlineSize: width }));
  }, [width]);

  useEffect(() => {
    if (!generalEpubReaderSettings.tts && inProgress) {
      console.log("STOPPPED IN THING");
      stop();
    }
  }, [generalEpubReaderSettings.tts]);

  useEffect(() => {
    if (inProgress) {
      setGeneralEpubReaderSettings((prev) => ({ ...prev, tts: true }));
    }
  }, [inProgress]);

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
              <Flex row justifyContent="space-between">
                <Flex row gap="$4">
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
                </Flex>
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
              </Flex>
              {/* Scroll & gap  */}
              <Flex row justifyContent="space-between">
                <Flex alignItems="center" space="$2">
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
                </Flex>
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
              </Flex>
              {/* line space */}
              {!isPdf ? (
                <Flex row justifyContent="space-between">
                  <Flex row ai="center" space="$4">
                    <Text>AudioPlayer mode</Text>
                    <Button
                      onPress={onBlockSizeChange}
                      borderColor={audioplayerMode ? "$blue10" : undefined}
                    >
                      <Fullscreen />
                    </Button>
                  </Flex>
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
                </Flex>
              ) : null}

              <Flex space>
                <Flex row ai="center" space="$4">
                  {!isPdf ? (
                    <>
                      <Text pr="$7">Text to Speech</Text>
                      <Switch
                        size={"$4"}
                        defaultChecked={generalEpubReaderSettings.tts}
                        checked={generalEpubReaderSettings.tts}
                        onCheckedChange={(checked) =>
                          setGeneralEpubReaderSettings({
                            ...generalEpubReaderSettings,
                            tts: checked,
                          })
                        }
                      >
                        <Switch.Thumb animation="quick" />
                      </Switch>
                    </>
                  ) : null}
                </Flex>
                {!isPdf &&
                Platform.OS === "ios" &&
                generalEpubReaderSettings.tts ? (
                  <TTSVoiceModal
                    setVoicesModalOpen={setVoicesModalOpen}
                    voice={voice}
                    voiceList={voiceList}
                    voicesModalOpen={voicesModalOpen}
                    setVoice={setVoice}
                  />
                ) : null}
              </Flex>
            </MenuContainer>
          ) : null}
        </Header>
      )}

      {hide && (
        <Footer paddingHorizontal="$4" paddingBottom="$4">
          <Flex row ai="center" fill>
            {Platform.OS === "ios" && generalEpubReaderSettings.tts ? (
              !paused ? (
                <Button
                  circular
                  onPress={async () => await pause()}
                  icon={() => <Pause size="$1" fill={color} />}
                  size="$4"
                  ai="center"
                  jc="center"
                />
              ) : (
                <Button
                  ai="center"
                  jc="center"
                  size="$4"
                  circular
                  onPress={async () => await resume()}
                  icon={() => <Play fill={color} size="$1" />}
                />
              )
            ) : null}
          </Flex>
        </Footer>
      )}
    </>
  );
};

export default Menu;
