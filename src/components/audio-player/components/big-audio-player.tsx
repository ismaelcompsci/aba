import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { getColors } from "react-native-image-colors";
import TrackPlayer from "react-native-track-player";
import { LinearGradient } from "@tamagui/linear-gradient";
import {
  FastForward,
  MoreVertical,
  Rewind,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import { H3, H6, Stack, XStack, YStack } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";

import { SEEK_INTERVAL } from "./audio-player-controls";
import { CirlceButton } from "./circle-button";
import { PlayPauseControl } from "./play-pause-control";
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
}: {
  audiobookInfo: AudiobookInfo;
}) => {
  const [colors, setColors] = useState(initialState);
  const { width } = Dimensions.get("window");

  const { color, bgPress } = useIconTheme();

  const imageWidth = width * 0.7;
  const imageHeight = imageWidth;

  useEffect(() => {
    (async () => {
      const result = await getColors(audiobookInfo.cover || "", {
        fallback: bgPress,
        cache: true,
        key: audiobookInfo.cover || "cover",
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
    })();
  }, []);
  console.log("[AUDIOPLAYER] BIG AUDIOPLAYER RERENDER");

  return (
    <YStack
      bg={"$backgroundPress"}
      width={"100%"}
      height={"100%"}
      borderRadius={"$7"}
    >
      <LinearGradient
        flex={1}
        colors={[colors.colorFour.value, "$backgroundPress"]}
        locations={[0.1, 0.7]}
        borderRadius={"$7"}
      >
        <YStack
          px={"$4"}
          flex={1}
          borderRadius={"$7"}
          paddingTop={48 + 10}
          space={"$2"}
        >
          <XStack ai={"center"} width={"100%"} justifyContent="flex-end">
            <CirlceButton
              bg={"transparent"}
              pressStyle={{ bg: "transparent", borderWidth: 0, opacity: 0.5 }}
            >
              <MoreVertical />
            </CirlceButton>
          </XStack>
          {/* IMAGE */}
          <XStack width={"100%"} height={"50%"} jc={"center"} ai={"center"}>
            <Stack $gtSm={{ pt: "$0" }} $gtMd={{ pt: "$9" }}>
              <FastImage
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  borderRadius: 16,
                }}
                resizeMode="cover"
                source={{
                  uri: audiobookInfo.cover || "",
                }}
              />
            </Stack>
          </XStack>
          {/* INFO */}
          <YStack paddingTop={"$5"} $gtSm={{ paddingTop: "$12" }}>
            <H3>{audiobookInfo.title}</H3>
            <H6>{audiobookInfo.author}</H6>
          </YStack>
          {/* PROGRESS */}
          <YStack space={"$2"} pt={"$4"} width={"100%"}>
            <ProgressSlider
              showThumb
              color={color}
              trackProps={{
                bg: "$backgroundStrong",
              }}
              audiobookInfo={audiobookInfo}
            />
          </YStack>
          {/* CONTROLS */}
          <XStack
            ai={"center"}
            width={"100%"}
            pt={"$4"}
            $gtSm={{ justifyContent: "center" }}
          >
            <CirlceButton onPress={() => TrackPlayer.skipToPrevious()}>
              <SkipBack fill={color} />
            </CirlceButton>
            <XStack
              ai={"center"}
              justifyContent="center"
              flex={1}
              $gtSm={{ flex: 0 }}
              gap={"$3"}
            >
              <CirlceButton
                h={"$6"}
                w={"$6"}
                onPress={() => TrackPlayer.seekBy(-SEEK_INTERVAL)}
              >
                <Rewind size="$3" fill={color} />
              </CirlceButton>
              <PlayPauseControl small={false} color={color} />
              <CirlceButton
                h={"$6"}
                w={"$6"}
                onPress={() => TrackPlayer.seekBy(SEEK_INTERVAL)}
              >
                <FastForward size="$3" fill={color} />
              </CirlceButton>
            </XStack>
            <CirlceButton onPress={() => TrackPlayer.skipToNext()}>
              <SkipForward fill={color} />
            </CirlceButton>
          </XStack>
        </YStack>
      </LinearGradient>

      {/* ACTIONS */}
    </YStack>
  );
};

export default BigAudioPlayer;
