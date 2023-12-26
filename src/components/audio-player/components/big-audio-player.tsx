import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { getColors } from "react-native-image-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Bookmark, ChevronDown, List } from "@tamagui/lucide-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { H3, H6, useTheme } from "tamagui";

import { IS_ANDROID } from "../../../constants/consts";
import { useOrientation } from "../../../hooks/use-orientation";
import { bookmarksModalAtom } from "../../../state/app-state";
import { appThemeAtom } from "../../../state/local-state";
import { Flex } from "../../layout/flex";
import AudioPlayerMore from "../../menus/audio-player-more";
import { chaptersModalAtom } from "../../modals/chapter-modal";
import { TouchableArea } from "../../touchable/touchable-area";

import BigAudioPlayerControls from "./big-audio-player-controls";
import PlaybackSpeedControls from "./playback-speed-controls";
import { ProgressSlider } from "./progress-slider";
import { AudiobookInfo } from "./small-audio-player";

const initialState = {
  colorOne: { value: "", name: "" },
  colorTwo: { value: "", name: "" },
  colorThree: { value: "", name: "" },
  colorFour: { value: "", name: "" },
  rawResult: "",
};

const BigAudioPlayer = ({
  audiobookInfo,
  closePlayer,
  libraryItemId,
}: {
  libraryItemId: string;
  audiobookInfo: AudiobookInfo;
  closePlayer?: () => void;
}) => {
  const { width, height } = useWindowDimensions();
  const { bottom, top, left, right } = useSafeAreaInsets();

  const orientation = useOrientation();

  const imageWidth = orientation === "PORTRAIT" ? width * 0.9 : 150;
  const imageHeight = imageWidth;

  return (
    <Flex
      $theme-oled={{
        backgroundColor: "$background",
      }}
      bg={"$backgroundPress"}
      width={width}
      height={height}
    >
      <BigAudioPlayerBackground cover={audiobookInfo.cover}>
        <Flex
          fill
          paddingTop={orientation === "PORTRAIT" ? top : top + 20}
          pl={left ? left : "$4"}
          pr={right ? right : "$4"}
          pb={orientation === "PORTRAIT" ? bottom : bottom + 40}
          justifyContent="space-between"
          w={"100%"}
        >
          <Flex row ai={"center"} width={"100%"} justifyContent="space-between">
            <TouchableArea
              borderRadius={"$12"}
              padding={"$0"}
              width={"$4"}
              height={"$4"}
              alignItems={"center"}
              justifyContent={"center"}
              bg="$background"
              onPress={() => closePlayer && closePlayer()}
            >
              <ChevronDown />
            </TouchableArea>
            <AudioPlayerMore closePlayer={closePlayer} />
          </Flex>
          {/* IMAGE */}
          <Flex
            jc={"center"}
            ai="center"
            style={{
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.32,
              shadowRadius: 5.46,
              elevation: 9,
            }}
            w={"100%"}
          >
            <FastImage
              style={{
                width: imageWidth,
                height: imageHeight,
                borderRadius: 16,
              }}
              resizeMode="contain"
              source={{
                uri: audiobookInfo.cover || "",
              }}
            />
          </Flex>
          <Flex space={"$2"}>
            {/* INFO */}
            <Flex>
              <H3>{audiobookInfo.title}</H3>
              <H6>{audiobookInfo.author}</H6>
            </Flex>
            {/* PROGRESS */}
            <ProgressSlider audiobookInfo={audiobookInfo} />
          </Flex>
          {/* CONTROLS */}
          <BigAudioPlayerControls />
          {/* ACTIONS */}
          <Flex row justifyContent="space-between" w={"100%"}>
            <ShowBookmarksButton libraryItemId={libraryItemId} />
            <PlaybackSpeedControls />
            <ShowChaptersButton />
          </Flex>
        </Flex>
      </BigAudioPlayerBackground>
    </Flex>
  );
};

const ShowBookmarksButton = ({ libraryItemId }: { libraryItemId: string }) => {
  const setBookmarksModalAtom = useSetAtom(bookmarksModalAtom);

  return (
    <TouchableArea
      borderRadius={"$12"}
      padding={"$0"}
      width={"$4"}
      height={"$4"}
      alignItems={"center"}
      justifyContent={"center"}
      hitSlop={24}
      onPress={() =>
        setBookmarksModalAtom({ open: true, libraryItemId: libraryItemId })
      }
    >
      <Bookmark />
    </TouchableArea>
  );
};

const ShowChaptersButton = () => {
  const setChaptersModal = useSetAtom(chaptersModalAtom);

  return (
    <TouchableArea
      borderRadius={"$12"}
      width={"$4"}
      height={"$4"}
      alignItems={"center"}
      justifyContent={"center"}
      onPress={() => setChaptersModal({ open: true })}
    >
      <List />
    </TouchableArea>
  );
};

const BigAudioPlayerBackground = ({
  children,
  cover,
}: {
  children: React.ReactNode;
  cover?: string | null;
}) => {
  const appScheme = useAtomValue(appThemeAtom);
  const { height } = useWindowDimensions();
  const colors = useTheme();

  const [gradientColors, setColors] = useState(initialState);

  useEffect(() => {
    (async () => {
      try {
        const result = await getColors(cover || "", {
          fallback: colors.backgroundPress.get(),
          cache: true,
          key: cover || "cover",
        });

        switch (result.platform) {
          case "android":
          case "web":
            setColors({
              colorOne: { value: result.lightVibrant, name: "lightVibrant" },
              colorTwo: { value: result.dominant, name: "dominant" },
              colorThree: { value: result.vibrant, name: "vibrant" },
              colorFour: { value: result.darkVibrant, name: "darkVibrant" },
              rawResult: JSON.stringify(result),
            });
            break;
          case "ios":
            setColors({
              colorOne: { value: result.background, name: "background" },
              colorTwo: { value: result.detail, name: "detail" },
              colorThree: { value: result.primary, name: "primary" },
              colorFour: { value: result.secondary, name: "secondary" },
              rawResult: JSON.stringify(result),
            });
            break;
          default:
            throw new Error("Unexpected platform");
        }
      } catch (error) {
        console.log("[BIGAUDIOPLAYER] get colors error ", error, cover);
      }
    })();
  }, [cover]);

  if (appScheme.scheme === "oled" || IS_ANDROID) {
    return (
      <Flex height={height} borderRadius={"$7"} bg="$backgroundPress">
        {children}
      </Flex>
    );
  } else
    return (
      <LinearGradient
        height={height}
        colors={[gradientColors.colorOne.value, "$backgroundPress"]}
        locations={[0.1, 0.65]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        borderRadius={"$7"}
      >
        {children}
      </LinearGradient>
    );
};

export default BigAudioPlayer;
