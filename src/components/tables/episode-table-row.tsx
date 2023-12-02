import { memo } from "react";
import React from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Text, useTheme } from "tamagui";

import { useUserMediaProgress } from "../../hooks/use-user-media-progress";
import { showPlayerAtom } from "../../state/app-state";
import { PodcastEpisodeExpanded } from "../../types/aba";
import { elapsedTime } from "../../utils/utils";
import RenderHTML from "../custom-components/render-html";
import ItemProgress from "../item-progress";
import { Flex } from "../layout/flex";
import { PodcastLabel } from "../podcast-label";
import { TouchableArea } from "../touchable/touchable-area";

import PlayingWidget from "./playing-widget";

const EpisodeTableRow = ({
  item,
  podcastId,
}: {
  item: PodcastEpisodeExpanded;
  podcastId: string;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const playerState = usePlaybackState();
  const { userProgressPercent, userMediaProgress } = useUserMediaProgress({
    libraryItemId: podcastId,
    episodeId: item.id,
  });

  const colors = useTheme();
  const color = colors.color.get();

  const episodeType = item.episodeType === "full" ? null : item.episodeType;
  const subtitle = item.subtitle;
  const isPlaying = playerState.state === State.Playing;
  const episodeNumber = item.episode;
  const season = item.season;

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
      playing: true,
      libraryItemId: podcastId,
      episodeId: episodeId,
    });
  };

  return (
    <TouchableArea hapticFeedback onPress={() => onEpisodePress(item.id)}>
      <Flex py="$2" space="$1.5">
        <Text fontSize={18}>{item.title}</Text>
        {!subtitle && item.description ? (
          <RenderHTML html={item.description} maxTextLength={60} />
        ) : (
          <Text>{item.subtitle}</Text>
        )}
        <Flex row alignItems="center" gap="$2">
          {episodeNumber ? (
            <PodcastLabel label={`Episode #${episodeNumber}`} />
          ) : null}
          {season ? <PodcastLabel label={`Season #${season}`} /> : null}
          {episodeType ? <PodcastLabel label={`${episodeType}`} /> : null}
        </Flex>
        <Flex row alignItems="center" pt="$4" space>
          <TouchableArea
            alignItems="center"
            borderWidth={1}
            borderColor={colors.gray8.get()}
            paddingHorizontal="$4"
            paddingVertical="$2"
            flexDirection="row"
            gap="$4"
            borderRadius="$6"
            onPress={() => onPlayItem(item.id)}
            opacity={userProgressPercent === 1 ? 0.8 : 1}
          >
            {showPlayer.playing &&
            showPlayer.episodeId === item.id &&
            isPlaying ? (
              <>
                <Pause size={18} fill={color} />
                <Text>Playing</Text>
              </>
            ) : (
              <>
                <Play size={18} fill={color} />
                <Text>{timeRemaining}</Text>
              </>
            )}
          </TouchableArea>
          {showPlayer.playing && item.id === showPlayer.episodeId ? (
            <PlayingWidget />
          ) : null}
          <Flex grow />
          <ItemProgress
            episodeId={item.id}
            id={podcastId}
            radius={18}
            activeStrokeWidth={5}
            inActiveStrokeWidth={6}
            progressValueFontSize={10}
            inActiveStrokeOpacity={0.4}
            circleBackgroundColor={colors.backgroundPress.get()}
            activeStrokeColor={color}
          />
        </Flex>
      </Flex>
    </TouchableArea>
  );
};

export default memo(EpisodeTableRow);
