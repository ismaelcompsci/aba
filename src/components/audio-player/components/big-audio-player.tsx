import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { getColors } from "react-native-image-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Bookmark, ChevronDown, List } from "@tamagui/lucide-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { H3, H6, useTheme } from "tamagui";

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
  setOpen,
  libraryItemId,
}: {
  libraryItemId: string;
  audiobookInfo: AudiobookInfo;
  setOpen?: (open: boolean) => void;
}) => {
  const { width, height } = useWindowDimensions();
  const { bottom, top, left, right } = useSafeAreaInsets();

  const colors = useTheme();
  const orientation = useOrientation();

  // const imageWidth = Math.min(
  //   width * 0.7,
  //   orientation === "PORTRAIT" ? 464 : 200
  // );

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
      borderRadius={"$7"}
    >
      <BigAudioPlayerBackground cover={audiobookInfo.cover}>
        <Flex
          fill
          paddingTop={orientation === "PORTRAIT" ? top : top + 20}
          pl={left ? left : "$4"}
          pr={right ? right : "$4"}
          pb={orientation === "PORTRAIT" ? bottom : bottom + 40}
          justifyContent="space-between"
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
              onPress={() => setOpen && setOpen(false)}
            >
              <ChevronDown />
            </TouchableArea>
            <AudioPlayerMore setOpen={setOpen} />
          </Flex>
          {/* IMAGE */}
          <Flex
            jc={"center"}
            ai="center"
            shadowColor={"$shadowColor"}
            style={{
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.32,
              shadowRadius: 5.46,
              elevation: 9,
            }}
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
          {/* INFO */}
          <H3>{audiobookInfo.title}</H3>
          <H6>{audiobookInfo.author}</H6>
          {/* PROGRESS */}
          <ProgressSlider
            showThumb
            color={colors.color.get()}
            trackProps={{
              bg: "$gray8",
            }}
            audiobookInfo={audiobookInfo}
          />
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

  if (appScheme.scheme === "oled") {
    return (
      <Flex height={height} borderRadius={"$7"}>
        {children}
      </Flex>
    );
  } else
    return (
      <LinearGradient
        height={height}
        colors={[gradientColors.colorOne.value, "$backgroundPress"]}
        // locations={[0.1, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        borderRadius={"$7"}
      >
        {children}
      </LinearGradient>
    );
};

export default BigAudioPlayer;
