import FastImage from "react-native-fast-image";
import { styled, Text, XStack, YStack } from "tamagui";

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
    <XStack flex={1} gap="$3" alignItems="center">
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
      <XStack alignItems="center" flex={1}>
        <YStack gap="$1" flex={1}>
          <Text fontSize={14} fontWeight={"$7"}>
            {audiobookInfo.title}
          </Text>
          <Text fontSize={14} color={"$gray10"} numberOfLines={1}>
            {audiobookInfo.author}
          </Text>
        </YStack>

        <AudioPlayerControls color={color} />
      </XStack>
    </XStack>
  );
};

export const SmallAudioPlayerWrapper = styled(YStack, {
  height: SMALL_PLAYER_HEIGHT,
  borderRadius: "$7",
  padding: "$3",
  bg: "$backgroundHover",
  mx: "$4",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  space: "$2",
});
