import { FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { Separator, Text } from "tamagui";

import { requestInfoAtom, showPlayerAtom } from "../../state/app-state";
import { PlaylistItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { elapsedTime } from "../../utils/utils";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../custom-components/bottom-sheet-modal";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";

export const playlistModalAtom = atom({ open: false });

export const PlaylistModal = () => {
  const setPlaylistModal = useSetAtom(playlistModalAtom);
  const showPlayer = useAtomValue(showPlayerAtom);
  const requestInfo = useAtomValue(requestInfoAtom);

  return (
    <AppBottomSheetModal
      fullScreen
      hideHandlebar
      renderBehindTopInset
      onClose={() => setPlaylistModal({ open: false })}
    >
      <Screen edges={["top"]} px="$2">
        <HandleBar containerFlexStyles={{ height: 30 }} />
        <FlatList
          data={showPlayer.playlist}
          ItemSeparatorComponent={Separator}
          renderItem={({ item, index }) => (
            <PlaylistModalItemRow
              key={index}
              playlistItem={item}
              index={index}
              serverAddress={requestInfo.serverAddress}
              userToken={requestInfo.token}
            />
          )}
        />
      </Screen>
    </AppBottomSheetModal>
  );
};

const PlaylistModalItemRow = ({
  playlistItem,
  userToken,
  serverAddress,
  index,
}: {
  playlistItem: PlaylistItemExpanded;
  userToken: string;
  serverAddress: string;
  index: number;
}) => {
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
    <Flex row alignItems="center">
      <Text fontSize={20} fontWeight={"800"}>
        {index}
      </Text>
      <Flex row padding={"$2"} alignItems="center" gap="$2.5">
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
          </Flex>
        </Flex>
        <Flex grow />
      </Flex>
    </Flex>
  );
};
