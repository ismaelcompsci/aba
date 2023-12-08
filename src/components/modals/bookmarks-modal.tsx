import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
  BookmarkCheck,
  Edit3,
  Plus,
  Timer,
  Trash2,
} from "@tamagui/lucide-icons";
import { useAtom, useAtomValue } from "jotai";
import { Button, ScrollView, Text, useTheme } from "tamagui";

import {
  bookmarksAtom,
  bookmarksModalAtom,
  currentPlayingLibraryIdAtom,
} from "../../state/app-state";
import { AudioBookmark } from "../../types/aba";
import { formatSeconds, secondsToTimestamp } from "../../utils/utils";
import { useAudioPlayerProgress } from "../audio-player/hooks/use-audio-player-progress";
import { Modal } from "../custom-components/modal";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

export const BookmarksModal = () => {
  const [bookmarksModal, setBookmarksModal] = useAtom(bookmarksModalAtom);
  const currentPlayingLibraryId = useAtomValue(currentPlayingLibraryIdAtom);

  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);

  const { width, height } = useWindowDimensions();

  const colors = useTheme();
  const iconColor = colors.gray10.get();

  const bookmarksForItem = useMemo(
    () =>
      bookmarks.filter((bk) => bk.libraryItemId === currentPlayingLibraryId),
    [currentPlayingLibraryId, bookmarks]
  );

  if (!bookmarksModal.open) return null;

  return (
    <Modal
      visible
      showCloseButton
      dimBackground
      transparent
      animationType="fade"
      hide={() => setBookmarksModal({ open: false })}
      title="Bookmarks"
    >
      <Flex width={width * 0.8} maxHeight={height * 0.5} space>
        <ScrollView space="$2">
          {bookmarksForItem.map((bk) => {
            return <Bookmark key={bk.title} bookmark={bk} color={iconColor} />;
          })}
        </ScrollView>
        <Button size={"$2.5"} icon={Plus} jc={"space-between"}>
          Create bookmark
          <Time />
        </Button>
      </Flex>
    </Modal>
  );
};

const Time = () => {
  const { currentPosition } = useAudioPlayerProgress();
  return (
    <Text color={"$gray11"} fontSize={12}>
      {formatSeconds(currentPosition)}
    </Text>
  );
};

const Bookmark = ({
  bookmark,
  color,
}: {
  bookmark: AudioBookmark;
  color: string;
}) => {
  return (
    <Flex
      key={bookmark.title}
      row
      jc={"space-between"}
      fill
      alignItems="center"
    >
      <Flex grow maxWidth={"70%"}>
        <Flex row fill>
          <BookmarkCheck size={"$1"} color={color} />
          <Text numberOfLines={1}>{bookmark.title}</Text>
        </Flex>
        <Flex row>
          <Timer size={"$1"} color={color} />
          <Text numberOfLines={1}>{secondsToTimestamp(bookmark.time)}</Text>
        </Flex>
      </Flex>
      <Flex row shrink alignItems="center" gap="$3">
        <TouchableArea>
          <Edit3 size={"$1"} />
        </TouchableArea>
        <TouchableArea>
          <Trash2 size={"$1"} />
        </TouchableArea>
      </Flex>
    </Flex>
  );
};
