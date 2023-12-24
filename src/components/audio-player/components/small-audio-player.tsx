import FastImage from "react-native-fast-image";
import { styled, Text } from "tamagui";

import { Flex } from "../../layout/flex";

import { AudioPlayerControls } from "./audio-player-controls";

const SMALL_PLAYER_HEIGHT = 80;

export type AudiobookInfo = {
  title?: string;
  author?: string;
  cover?: string | null | undefined;
};

export const AudioPlayerInfo = ({
  audiobookInfo,
  color,
}: {
  audiobookInfo: AudiobookInfo;
  color: string;
}) => {
  return (
    <Flex row fill gap="$3" alignItems="center">
      {audiobookInfo.cover ? (
        <FastImage
          style={{
            borderRadius: 2,
            width: 42,
            height: 42,
          }}
          resizeMode="contain"
          source={{
            uri: audiobookInfo.cover,
            priority: "low",
          }}
        />
      ) : null}
      <Flex row alignItems="center" flex={1}>
        <Flex gap="$1" flex={1}>
          <Text fontSize={14} fontWeight={"$7"}>
            {audiobookInfo.title}
          </Text>
          <Text fontSize={14} numberOfLines={1}>
            {audiobookInfo.author}
          </Text>
        </Flex>

        <AudioPlayerControls color={color} />
      </Flex>
    </Flex>
  );
};

export const SmallAudioPlayerWrapper = styled(Flex, {
  height: SMALL_PLAYER_HEIGHT,
  borderRadius: "$7",
  padding: "$3",
  bg: "$backgroundPress",
  mx: "$4",
  justifyContent: "center",
  space: "$2",
});
