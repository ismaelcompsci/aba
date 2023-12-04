import { memo } from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { BookOpen, Pause, Play } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai/react";
import { Button, Text, useTheme } from "tamagui";

import { showPlayerAtom } from "../../state/app-state";
import { LibraryItemExpanded } from "../../types/aba";
import { TouchableArea } from "../touchable/touchable-area";

const PlayButton = ({
  bookItemId,
  id,
  textColor,
}: {
  bookItemId: string;
  id: string;
  textColor: string;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const playerPlayPress = () => {
    if (isPlaying) {
      if (showPlayer.libraryItemId === id) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({ playing: true, libraryItemId: bookItemId });
      }
    } else {
      if (showPlayer.playing && showPlayer.libraryItemId === id) {
        TrackPlayer.play();
      } else {
        setShowPlayer({ playing: true, libraryItemId: bookItemId });
      }
    }
  };

  return (
    <TouchableArea
      borderRadius={"$4"}
      bg={"$color"}
      flexDirection="row"
      alignItems="center"
      jc={"center"}
      px={"$9"}
      flex={1}
      minHeight={"$4"}
      gap={"$2"}
      onPress={playerPlayPress}
    >
      {isPlaying && showPlayer.libraryItemId === id ? (
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
  );
};

const OpenItemActionButton = ({
  bookItem,
  id,
}: {
  bookItem: LibraryItemExpanded;
  id: string;
}) => {
  const colors = useTheme();
  const background = colors.background.get();

  const isMissing = bookItem?.isMissing;
  const isInvalid = bookItem?.isInvalid;

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
      <PlayButton bookItemId={bookItem.id} id={id} textColor={background} />
    );
  } else if (showRead) {
    return (
      <TouchableArea
        borderRadius={"$4"}
        bg={"$color"}
        flexDirection="row"
        alignItems="center"
        jc={"center"}
        px={"$9"}
        flex={1}
        gap={"$2"}
        minHeight={"$4"}
        onPress={() => router.push(`/reader/${bookItem.id}`)}
      >
        <BookOpen color={background} size="$1" />
        <Text color={background}>Read {ebookFormat?.toUpperCase()}</Text>
      </TouchableArea>
    );
  } else {
    return (
      <Button chromeless bg={"$red10Dark"} flex={1} disabled>
        <Text>Empty</Text>
      </Button>
    );
  }
};

export default memo(OpenItemActionButton);
