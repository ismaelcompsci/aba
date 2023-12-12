import { useMemo } from "react";
import FastImage from "react-native-fast-image";
import { FlatList } from "react-native-gesture-handler";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Spinner, Text, useTheme } from "tamagui";

import { CollectionCover } from "../../components/covers/collections-cover";
import { VirtualizedList } from "../../components/custom-components/virtual-scroll-view";
import ItemProgress from "../../components/item-progress";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import BookMoreMenu from "../../components/menus/book-more-menu";
import { TouchableArea } from "../../components/touchable/touchable-area";
import {
  isCoverSquareAspectRatioAtom,
  requestInfoAtom,
  showPlayerAtom,
} from "../../state/app-state";
import { CollectionExpanded, LibraryItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { elapsedTime } from "../../utils/utils";

const CollectionsPage = () => {
  const { id } = useLocalSearchParams();
  const requestInfo = useAtomValue(requestInfoAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  const { data, isLoading } = useQuery({
    queryKey: ["collections-page", id],
    queryFn: async () => {
      const response: { data: CollectionExpanded } = await axios.get(
        `${requestInfo.serverAddress}/api/collections/${id}`,
        { headers: { Authorization: `Bearer ${requestInfo.token}` } }
      );

      return response.data;
    },
  });

  const showPlayButton = useMemo(
    () =>
      Boolean(
        data?.books.filter((item) => {
          if (item.isMissing || item.isInvalid) return false;
          return "tracks" in item.media ? item.media.tracks.length : 0;
        }).length
      ),
    [id, data]
  );

  return (
    <Screen edges={["left", "right", "top"]}>
      <BackHeader
        // endAdornment={
        //   userToken ? (
        //     <PlaylistPageMore
        //       name={name as string}
        //       playlistId={id as string}
        //       serverAddress={serverAddress}
        //       userToken={userToken}
        //     />
        //   ) : undefined
        // }
        alignment="center"
        mx={16}
        py={8}
      >
        <Text fontSize={18}>{data?.name}</Text>
      </BackHeader>
      <Flex fill>
        {isLoading || !data ? (
          <Spinner />
        ) : (
          <VirtualizedList contentContainerStyle={{ paddingBottom: 44 }}>
            <Flex fill p="$4" space>
              <CollectionPageHeader
                isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                data={data}
                serverAddress={requestInfo.serverAddress}
                userToken={requestInfo.token}
                showPlayButton={showPlayButton}
              />
              <CollectionsTable
                data={data}
                serverAddress={requestInfo.serverAddress}
                userToken={requestInfo.token}
                isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              />
            </Flex>
          </VirtualizedList>
        )}
      </Flex>
    </Screen>
  );
};

const CollectionPageHeader = ({
  data,
  serverAddress,
  userToken,
  showPlayButton,
  isCoverSquareAspectRatio,
}: {
  data: CollectionExpanded;
  serverAddress: string;
  userToken: string;
  showPlayButton: boolean;
  isCoverSquareAspectRatio: boolean;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const width = 240;
  const height = isCoverSquareAspectRatio ? width : 120 * 1.6;

  const colors = useTheme();
  const textColor = colors.color.get();

  const playItem = () => {
    const firstItem = data.books[0];

    if (isPlaying) {
      if (showPlayer.playing) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem.id,
        });
      }
    } else {
      if (showPlayer.playing) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem.id,
        });
      }
    }
  };

  const isPlaylistPlaying = useMemo(
    () => data.books.find((item) => item.id === showPlayer.libraryItemId),
    [showPlayer, data]
  );

  return (
    <Flex space>
      <Flex centered>
        <Flex>
          <CollectionCover
            items={data.books}
            height={height}
            width={width}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        </Flex>
      </Flex>
      {showPlayButton ? (
        <TouchableArea
          theme="blue"
          bg="$blue7"
          borderRadius={"$4"}
          flexDirection="row"
          alignItems="center"
          jc={"center"}
          px={"$9"}
          flex={1}
          minHeight={"$4"}
          gap={"$2"}
          onPress={playItem}
        >
          {isPlaying && isPlaylistPlaying ? (
            <>
              <Pause color={textColor} />
              <Text color={textColor}>Pause</Text>
            </>
          ) : (
            <>
              <Play size="$1" color={textColor} />
              <Text color={textColor}>Play</Text>
            </>
          )}
        </TouchableArea>
      ) : null}
    </Flex>
  );
};

const CollectionsTable = ({
  data,
  userToken,
  serverAddress,
  isCoverSquareAspectRatio,
}: {
  data: CollectionExpanded;
  userToken: string;
  serverAddress: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  return (
    <Flex bg="$backgroundHover" px="$2" borderRadius={"$4"} pb={"$4"}>
      <Flex justifyContent="space-between" row alignItems="center" py="$4">
        <Text fontSize={24} $gtMd={{ fontSize: 34 }}>
          {data.name}
        </Text>
        <Flex p="$2" borderRadius={"$10"} bg={"$backgroundFocus"}>
          <Text
            $gtMd={{
              fontSize: 18,
            }}
          >
            {data.books.length}
          </Text>
        </Flex>
      </Flex>
      <Flex bg="$backgroundHover" fill borderRadius="$4" px="$1">
        <FlatList
          data={data.books}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Flex h={16} />}
          renderItem={({ item }) => (
            <CollectionItemRow
              collectionItem={item}
              serverAddress={serverAddress}
              userToken={userToken}
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            />
          )}
        />
      </Flex>
    </Flex>
  );
};

const CollectionItemRow = ({
  collectionItem,
  userToken,
  serverAddress,
  isCoverSquareAspectRatio,
}: {
  collectionItem: LibraryItemExpanded;
  userToken: string;
  serverAddress: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const width = 50;
  const height = isCoverSquareAspectRatio ? width : width * 1.6;

  const coverUrl = getItemCoverSrc(
    collectionItem,
    null,
    userToken,
    serverAddress
  );

  const itemTitle = collectionItem.media.metadata.title || "";

  const itemAuthor =
    "authorName" in collectionItem.media.metadata
      ? collectionItem.media.metadata.authorName || ""
      : "";

  const tracks =
    "tracks" in collectionItem.media ? collectionItem.media.tracks : [];
  const duration =
    "duration" in collectionItem.media ? collectionItem.media.duration : 0;

  const showPlayButton =
    !collectionItem.isMissing && !collectionItem.isInvalid && tracks.length;

  return (
    <TouchableArea
      borderRadius={"$4"}
      bg={"$backgroundFocus"}
      onPress={() => router.push(`/book/${collectionItem.id}`)}
    >
      <Flex row padding={"$2"} alignItems="center" gap="$2.5">
        {coverUrl ? (
          <FastImage
            resizeMode="cover"
            style={{
              width: width,
              height: height,
              borderRadius: 4,
            }}
            source={{
              uri: coverUrl,
            }}
          />
        ) : null}
        <Flex pos={"absolute"} top={0} left={width - 9}>
          <ItemProgress
            id={collectionItem.id}
            radius={12}
            activeStrokeWidth={3}
            inActiveStrokeWidth={4}
            circleBackgroundColor="black"
          />
        </Flex>
        <Flex space="$1" maxWidth={"50%"}>
          <Text fontSize={16} numberOfLines={1}>
            {itemTitle}
          </Text>
          <Text fontSize={14} numberOfLines={1} color="$gray10">
            {itemAuthor}
          </Text>
          <Text fontSize={10} color="$gray8">
            {elapsedTime(duration)}
          </Text>
        </Flex>
        <Flex grow />
        {showPlayButton ? <PlayButton id={collectionItem.id} /> : null}
        <BookMoreMenu itemId={collectionItem.id} vertical />
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

export default CollectionsPage;
