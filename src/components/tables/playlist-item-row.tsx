import React from "react";
import FastImage from "react-native-fast-image";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { GripVertical, Pause, Play } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Text, useTheme } from "tamagui";

import { showPlayerAtom } from "../../state/app-state";
import { PlaylistItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { elapsedTime } from "../../utils/utils";
import ItemProgress from "../item-progress";
import { Flex } from "../layout/flex";
import BookMoreMenu from "../menus/book-more-menu";
import { TouchableArea, TouchableAreaProps } from "../touchable/touchable-area";

export const PlaylistItemRow = ({
  playlistItem,
  userToken,
  serverAddress,
  ...rest
}: {
  playlistItem: PlaylistItemExpanded;
  userToken: string;
  serverAddress: string;
} & TouchableAreaProps) => {
  const itemCoverSize = 64;

  const coverUrl = getItemCoverSrc(
    playlistItem.libraryItem,
    null,
    userToken,
    serverAddress
  );

  const episode = playlistItem.episode;

  const itemTitle = playlistItem.episode
    ? playlistItem.episode.title
    : playlistItem.libraryItem.media.metadata.title || "";

  const itemAuthor = episode
    ? // @ts-ignore
      playlistItem.libraryItem.media.metadata.author
    : "";

  const duration = episode
    ? playlistItem.episode?.duration
    : // @ts-ignore
      playlistItem.libraryItem.media.duration;

  const tracks = playlistItem.episode
    ? []
    : // @ts-ignore
      playlistItem.libraryItem.media.tracks;
  const isMissing = playlistItem.libraryItem.isMissing;
  const isInvalid = playlistItem.libraryItem.isInvalid;

  const showPlayButton =
    !isMissing && !isInvalid && (tracks.length || playlistItem.episode);

  return (
    <TouchableArea
      bg={"$backgroundFocus"}
      onPress={() =>
        episode
          ? router.push(
              `/book/${playlistItem.libraryItemId}/${playlistItem.episodeId}`
            )
          : router.push(`/book/${playlistItem.libraryItemId}`)
      }
      {...rest}
    >
      <Flex row padding={"$2"} alignItems="center" gap="$2.5">
        <GripVertical size={12} />
        {coverUrl ? (
          <FastImage
            resizeMode="cover"
            style={{
              width: itemCoverSize,
              height: itemCoverSize,
              borderRadius: 4,
            }}
            source={{
              uri: coverUrl,
            }}
          />
        ) : null}

        <Flex space="$1" maxWidth={"42%"}>
          <Text fontSize={16} numberOfLines={1}>
            {itemTitle}
          </Text>
          <Text fontSize={14} numberOfLines={1}>
            {itemAuthor}
          </Text>
          <Flex row ai="center" jc="space-between">
            {showPlayButton ? (
              <Text fontSize={12} numberOfLines={1} color={"$gray11"}>
                {elapsedTime(duration)}
              </Text>
            ) : null}
            <ItemProgress
              id={playlistItem.libraryItemId}
              episodeId={
                playlistItem.episodeId ? playlistItem.episodeId : undefined
              }
              radius={10}
              activeStrokeWidth={2}
              inActiveStrokeWidth={3}
              circleBackgroundColor="black"
            />
          </Flex>
        </Flex>
        <Flex grow />
        {showPlayButton ? (
          <PlayButton
            id={playlistItem.libraryItemId}
            episodeId={playlistItem.episodeId}
          />
        ) : null}
        <BookMoreMenu
          itemId={playlistItem.libraryItemId}
          episodeId={
            playlistItem.episodeId ? playlistItem.episodeId : undefined
          }
          vertical
        />
      </Flex>
    </TouchableArea>
  );
};

const PlayButton = ({
  id,
  episodeId,
}: {
  id: string;
  episodeId?: string | null;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const colors = useTheme();
  const textColor = colors.color.get();

  const episodePlaying = episodeId ? episodeId === showPlayer.episodeId : true;

  const playItem = () => {
    if (isPlaying) {
      if (
        showPlayer.playing &&
        showPlayer.libraryItemId === id &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: id,
          episodeId: episodeId ? episodeId : undefined,
        });
      }
    } else {
      if (
        showPlayer.playing &&
        showPlayer.libraryItemId === id &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: id,
          episodeId: episodeId ? episodeId : undefined,
        });
      }
    }
  };

  return (
    <TouchableArea
      borderColor={"$blue7"}
      borderRadius={"$8"}
      borderWidth={1}
      jc={"center"}
      alignItems="center"
      p="$2.5"
      width={"$3.5"}
      height={"$3.5"}
      flexDirection="row"
      onPress={playItem}
    >
      <Flex ai={"center"} jc={"center"} pos={"absolute"} right={"$2"}>
        {isPlaying && showPlayer.libraryItemId === id && episodePlaying ? (
          <Pause color={textColor} />
        ) : (
          <Play size="$1" color={textColor} />
        )}
      </Flex>
    </TouchableArea>
  );
};
