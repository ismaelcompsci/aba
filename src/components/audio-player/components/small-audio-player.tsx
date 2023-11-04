import { Image, styled, Text, XStack, YStack } from "tamagui";

import { AudioPlayerControls } from "./audio-player-controls";

const SMALL_PLAYER_HEIGHT = 80;

export type AudiobookInfo = {
  title?: string;
  author?: string;
  cover?: string | null | undefined;
};

export const AudioPlayerInfo = ({
  audiobookInfo,
  playing,
  color,
}: {
  audiobookInfo: AudiobookInfo;
  playing: boolean;
  color: string;
}) => {
  return (
    <XStack flex={1} gap="$3" alignItems="center">
      {audiobookInfo.cover ? (
        <Image
          width={42}
          height={42}
          resizeMode="contain"
          source={{
            uri: audiobookInfo.cover,
          }}
        />
      ) : null}
      <XStack alignItems="center" flex={1}>
        <YStack gap="$1" flex={1}>
          <Text fontSize={14} fontWeight={"$7"}>
            {audiobookInfo.title}
          </Text>
          <Text fontSize={14} color={"$gray10"}>
            {audiobookInfo.author}
          </Text>
        </YStack>

        <AudioPlayerControls
          playing={playing ? playing : false}
          color={color}
        />
      </XStack>
    </XStack>
  );
};

export const SmallAudioPlayerWrapper = styled(YStack, {
  // bg: "$backgroundFocus",
  height: SMALL_PLAYER_HEIGHT,
  borderRadius: "$7",
  padding: "$3",
});
