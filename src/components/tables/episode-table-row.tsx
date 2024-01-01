import { memo, useMemo } from "react";
import React from "react";
import FastImage from "react-native-fast-image";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Text, useTheme } from "tamagui";

import { useUserMediaProgress } from "../../hooks/use-user-media-progress";
import { showPlayerAtom } from "../../state/app-state";
import { PodcastEpisodeExpanded } from "../../types/aba";
import { elapsedTime } from "../../utils/utils";
import ItemProgress from "../item-progress";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

import PlayingWidget from "./playing-widget";

const EpisodeTableRow = ({
  item,
  podcastId,
  cover,
  numberOfLines,
}: {
  item: PodcastEpisodeExpanded;
  podcastId: string;
  cover?: string;
  numberOfLines?: number;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const playerState = usePlaybackState();
  const { userProgressPercent, userMediaProgress } = useUserMediaProgress({
    libraryItemId: podcastId,
    episodeId: item.id,
  });

  const colors = useTheme();
  const color = colors.color.get();

  const isPlaying = playerState.state === State.Playing;

  const cleanedDescription = useMemo(() => {
    const regex = /(<([^>]+)>)/gi;
    const result = item.description.replace(regex, "");

    return result;
  }, [item.id]);

  const formattedDate = useMemo(() => {
    let _format = "MMM d";
    const publishedAt = new Date(item.publishedAt);

    if (publishedAt.getFullYear() - new Date().getFullYear() > 1) {
      _format = "LL/dd/yyyy";
    }

    return format(publishedAt, _format);
  }, []);

  const timeRemaining = !userProgressPercent
    ? elapsedTime(item.duration)
    : userProgressPercent === 1
    ? "Finished"
    : `${elapsedTime(
        Math.floor(item.duration - (userMediaProgress?.currentTime ?? 0))
      )}`;

  const onEpisodePress = (episodeId: string) => {
    router.push(`/book/${podcastId}/${episodeId}`);
  };

  const onPlayItem = (episodeId: string) => {
    const sameEpisode = episodeId === showPlayer.episodeId;

    if (isPlaying && sameEpisode) {
      TrackPlayer.pause();
      return;
    }

    if (showPlayer.playing && sameEpisode) {
      TrackPlayer.play();
      return;
    }

    setShowPlayer({
      open: true,
      playing: true,
      libraryItemId: podcastId,
      episodeId: episodeId,
    });
  };

  return (
    <TouchableArea
      hapticFeedback
      onPress={() => onEpisodePress(item.id)}
      py="$2.5"
    >
      <Flex fill row space={"$2"}>
        {cover ? (
          <FastImage
            resizeMode="cover"
            style={{
              height: 100,
              width: 100,
              borderRadius: 4,
            }}
            source={{
              uri: cover,
            }}
          />
        ) : null}
        <Flex fill space="$1.5" grow>
          <Flex gap="$1">
            <Text fontWeight={"700"} color={"$gray11"} fontSize={11}>
              {formattedDate}
            </Text>

            <Text fontWeight={"800"} fontSize={16}>
              {item.title}
            </Text>

            {cleanedDescription ? (
              <Text
                numberOfLines={numberOfLines ? numberOfLines : 3}
                color={"$gray11"}
              >
                {cleanedDescription}
              </Text>
            ) : null}
          </Flex>

          <Flex grow />
          <Flex shrink row alignItems="center" justifyContent="center" gap="$2">
            <TouchableArea
              alignItems="center"
              borderWidth={1}
              borderColor={colors.gray8.get()}
              paddingHorizontal="$3.5"
              bg={"$backgroundHover"}
              paddingVertical={6}
              flexDirection="row"
              gap="$1.5"
              borderRadius="$7"
              onPress={() => onPlayItem(item.id)}
              opacity={userProgressPercent === 1 ? 0.8 : 1}
            >
              {showPlayer.playing &&
              showPlayer.episodeId === item.id &&
              isPlaying ? (
                <>
                  <Pause size={14} fill={color} />
                  <Text fontSize={12}>Playing</Text>
                </>
              ) : (
                <>
                  <Play size={14} fill={color} />
                  <Text fontWeight={"600"} fontSize={12}>
                    {timeRemaining}
                  </Text>
                </>
              )}
            </TouchableArea>
            {showPlayer.playing && item.id === showPlayer.episodeId ? (
              <PlayingWidget initalHeight={28} />
            ) : null}
            <Flex grow />
            <ItemProgress
              episodeId={item.id}
              id={podcastId}
              radius={14}
              activeStrokeWidth={3}
              inActiveStrokeWidth={4}
              progressValueFontSize={10}
              inActiveStrokeOpacity={0.4}
              circleBackgroundColor={colors.backgroundPress.get()}
              activeStrokeColor={color}
            />
          </Flex>
        </Flex>
      </Flex>
    </TouchableArea>
  );
};

export default memo(EpisodeTableRow);
