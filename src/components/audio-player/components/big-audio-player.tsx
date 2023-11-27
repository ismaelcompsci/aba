import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { getColors } from "react-native-image-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Bookmark, ChevronDown } from "@tamagui/lucide-icons";
import { H3, H6 } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";
import { Flex } from "../../layout/flex";
import AudioPlayerMore from "../../menus/audio-player-more";
import ChaptersModal from "../../modals/chapter-modal";

import BigAudioPlayerControls from "./big-audio-player-controls";
import { CirlceButton } from "./circle-button";
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
}: {
  audiobookInfo: AudiobookInfo;
  setOpen: (open: boolean) => void;
}) => {
  const [colors, setColors] = useState(initialState);
  const { width, height } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  const { color, bgPress } = useIconTheme();

  const imageWidth = Math.min(width * 0.7, 464);
  const imageHeight = imageWidth;

  useEffect(() => {
    (async () => {
      try {
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
      } catch (error) {
        console.log(
          "[BIGAUDIOPLAYER] get colors error ",
          error,
          audiobookInfo.cover
        );
      }
    })();
  }, [audiobookInfo]);

  return (
    <Flex
      bg={"$backgroundPress"}
      width={width}
      height={height}
      borderRadius={"$7"}
    >
      <LinearGradient
        height={height}
        colors={[colors.colorFour.value, "$backgroundPress"]}
        locations={[0.1, 0.7]}
        borderRadius={"$7"}
      >
        <Flex
          fill
          px={"$4"}
          borderRadius={"$7"}
          paddingTop={48 + 10}
          space={"$2"}
        >
          <Flex row ai={"center"} width={"100%"} justifyContent="space-between">
            <CirlceButton onPress={() => setOpen(false)}>
              <ChevronDown />
            </CirlceButton>
            <AudioPlayerMore setOpen={setOpen} />
          </Flex>
          {/* IMAGE */}
          <Flex row width={"100%"} height={"50%"} jc={"center"} ai={"center"}>
            <Flex $gtSm={{ pt: "$0" }} $gtMd={{ pt: "$9" }}>
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
            </Flex>
          </Flex>
          {/* INFO */}
          <Flex paddingTop={"$5"} $gtSm={{ paddingTop: "$12" }}>
            <H3>{audiobookInfo.title}</H3>
            <H6>{audiobookInfo.author}</H6>
          </Flex>
          {/* PROGRESS */}
          <Flex space={"$2"} pt={"$4"} width={"100%"}>
            <ProgressSlider
              showThumb
              color={color}
              trackProps={{
                bg: "$backgroundStrong",
              }}
              audiobookInfo={audiobookInfo}
            />
          </Flex>
          {/* CONTROLS */}
          <BigAudioPlayerControls />
          {/* ACTIONS */}
          <Flex row ai="flex-end" flex={1}>
            <Flex
              row
              p={"$4"}
              pb={bottom}
              justifyContent="space-between"
              w={"100%"}
              $platform-android={{
                paddingBottom: "$4",
              }}
            >
              <CirlceButton bg={"$backgroundFocus"}>
                <Bookmark />
              </CirlceButton>

              <PlaybackSpeedControls />
              <ChaptersModal />
            </Flex>
          </Flex>
        </Flex>
      </LinearGradient>
    </Flex>
  );
};

export default BigAudioPlayer;
