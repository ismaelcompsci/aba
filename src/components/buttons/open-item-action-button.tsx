import { memo } from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { BookOpen, Pause, Play } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai/react";
import { Button, Text } from "tamagui";

import { showPlayerAtom } from "../../state/app-state";
import { LibraryItemExpanded } from "../../types/aba";
import { ActionButton } from "../book-info";

const OpenItemActionButton = ({
  bookItem,
  id,
}: {
  bookItem: LibraryItemExpanded;
  id: string;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const isMissing = bookItem?.isMissing;
  const isInvalid = bookItem?.isInvalid;

  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const ebookFile =
    "ebookFile" in bookItem.media ? bookItem.media.ebookFile : null;
  const ebookFormat = ebookFile?.ebookFormat;

  const canShowPlay = () => {
    if (!bookItem || isMissing || isInvalid) return false;
    if ("tracks" in bookItem.media && bookItem.media.tracks) {
      return !!bookItem.media.tracks.length;
    }
    if ("episodes" in bookItem.media && bookItem.media.episodes) {
      return !!bookItem.media.episodes.length;
    }
    return false;
  };

  const canShowRead = () => {
    if (!bookItem || isMissing || isInvalid) return false;

    if ("ebookFile" in bookItem.media && bookItem.media.ebookFile) {
      return true;
    }

    return false;
  };

  const showPlay = canShowPlay();
  const showRead = canShowRead();
  if (showPlay) {
    return (
      <ActionButton
        onPress={() => {
          isPlaying
            ? showPlayer.libraryItemId === id
              ? TrackPlayer.pause()
              : setShowPlayer({ playing: true, libraryItemId: bookItem.id })
            : showPlayer.playing && showPlayer.libraryItemId === id
            ? TrackPlayer.play()
            : setShowPlayer({ playing: true, libraryItemId: bookItem.id });
        }}
        bg={"$green10"}
      >
        {isPlaying && showPlayer.libraryItemId === id ? (
          <>
            <Pause />
            <Text>Pause</Text>
          </>
        ) : (
          <>
            <Play size="$1" />
            <Text>Play</Text>
          </>
        )}
      </ActionButton>
    );
  } else if (showRead) {
    return (
      <ActionButton
        bg={"$blue10"}
        onPress={() => router.push(`/reader/${bookItem.id}`)}
      >
        <BookOpen size="$1" />
        <Text>Read {ebookFormat?.toUpperCase()}</Text>
      </ActionButton>
    );
  } else {
    return (
      <Button
        chromeless
        onPress={() => console.log("ITEM IS MISSING")}
        bg={"$red10Dark"}
        theme={"blue"}
        flex={1}
      >
        <Text>Missing</Text>
      </Button>
    );
  }
};

export default memo(OpenItemActionButton, (prev, next) => {
  if (
    "ebookFile" in prev.bookItem.media &&
    "ebookFile" in next.bookItem.media
  ) {
    return (
      prev.bookItem.media.ebookFile?.ino === next.bookItem.media.ebookFile?.ino
    );
  } else if (
    "tracks" in prev.bookItem.media &&
    "tracks" in next.bookItem.media
  ) {
    return prev.bookItem.updatedAt === next.bookItem.updatedAt;
  } else return false;
});
