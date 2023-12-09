import { useMemo, useState } from "react";
import { Alert, useWindowDimensions } from "react-native";
import {
  ArrowLeft,
  BookmarkCheck,
  Edit3,
  Plus,
  Timer,
  Trash2,
} from "@tamagui/lucide-icons";
import axios from "axios";
import { format } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import { Input, Label, ScrollView, Text, useTheme } from "tamagui";

import {
  bookmarksAtom,
  bookmarksModalAtom,
  currentPlayingLibraryIdAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { AudioBookmark } from "../../types/aba";
import { formatSeconds, secondsToTimestamp } from "../../utils/utils";
import { useAudioPlayerProgress } from "../audio-player/hooks/use-audio-player-progress";
import { Modal } from "../custom-components/modal";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

type ShowForm = {
  open: boolean;
  edit?: {
    title: string;
    time: number;
  };
};

export const BookmarksModal = () => {
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const [bookmarksModal, setBookmarksModal] = useAtom(bookmarksModalAtom);
  const currentPlayingLibraryId = useAtomValue(currentPlayingLibraryIdAtom);

  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);

  const [showForm, setShowForm] = useState<ShowForm>({ open: false });

  const { width, height } = useWindowDimensions();

  const colors = useTheme();
  const iconColor = colors.gray10.get();

  const bookmarksForItem = useMemo(
    () =>
      bookmarks.filter((bk) => bk.libraryItemId === currentPlayingLibraryId),
    [currentPlayingLibraryId, bookmarks]
  );

  const removeBookmark = async (b: AudioBookmark) => {
    try {
      await axios.delete(
        `${serverAddress}/api/me/item/${bookmarksModal.libraryItemId}/bookmark/${b.time}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const newBk = bookmarks.filter((bk) => bk.time !== b.time);
      setBookmarks(newBk);
    } catch (error) {
      console.log("[BOOKMARKS_MODAL] removeBoookmark error", error);
    }
  };

  const updateBookmark = async (bk: { time: number; title: string }) => {
    try {
      const response = await axios.patch(
        `${serverAddress}/api/me/item/${bookmarksModal.libraryItemId}/bookmark`,
        bk,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setBookmarks([
        ...bookmarks.filter((b) => b.time !== response.data.time),
        response.data,
      ]);
    } catch (error) {
      console.log("[BOOKMARKS_MODAL] updateBookmark error", error);
    } finally {
      setShowForm({ open: false });
    }
  };

  const createBookmark = async ({
    text,
    currentTime,
  }: {
    text: string;
    currentTime: number;
  }) => {
    try {
      if (!text) {
        text = format(Date.now(), "MMM dd, yyyy HH:mm");
      }

      const bookmark = {
        title: text,
        time: currentTime,
      };

      const response = await axios.post(
        `${serverAddress}/api/me/item/${bookmarksModal.libraryItemId}/bookmark`,
        bookmark,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setBookmarks([...bookmarks, response.data]);
    } catch (error) {
      console.log("[BOOKMARKSMODAL] createBookmark error", error);
    } finally {
      setShowForm({ open: false });
    }
  };

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
      {!showForm.open ? (
        <Flex width={width * 0.8} maxHeight={height * 0.5} space>
          <ScrollView space="$2">
            {bookmarksForItem.map((bk) => {
              return (
                <Bookmark
                  key={bk.title}
                  bookmark={bk}
                  color={iconColor}
                  removeBookmark={removeBookmark}
                  setShowFrom={setShowForm}
                />
              );
            })}
          </ScrollView>
          <TouchableArea
            jc={"space-between"}
            alignItems="center"
            flexDirection="row"
            onPress={() => setShowForm({ open: true })}
          >
            <Plus size={16} />
            <Text>Create bookmark</Text>
            <Time />
          </TouchableArea>
        </Flex>
      ) : (
        <CreateBookmarkFrom
          showForm={showForm}
          setShowForm={setShowForm}
          createBookmark={createBookmark}
          updateBookmark={updateBookmark}
          height={height}
          width={width}
        />
      )}
    </Modal>
  );
};

const CreateBookmarkFrom = ({
  setShowForm,
  updateBookmark,
  createBookmark,
  height,
  width,
  showForm,
}: {
  showForm: ShowForm;
  height: number;
  width: number;
  setShowForm: (form: ShowForm) => void;
  updateBookmark: (bk: { title: string; time: number }) => void;
  createBookmark: ({
    text,
    currentTime,
  }: {
    text: string;
    currentTime: number;
  }) => void;
}) => {
  const defaultValue = useMemo(
    () => format(Date.now(), "MMM dd, yyyy HH:mm"),
    []
  );
  const [value, setValue] = useState(
    showForm.edit ? showForm.edit.title : defaultValue
  );
  const { currentPosition } = useAudioPlayerProgress();

  return (
    <Flex width={width * 0.8} maxHeight={height * 0.5} space>
      <Flex row jc={"space-between"} alignItems="center">
        <TouchableArea onPress={() => setShowForm({ open: false })}>
          <ArrowLeft />
        </TouchableArea>
        {showForm.edit ? <Time big value={showForm.edit.time} /> : <Time big />}
      </Flex>
      <Flex>
        <Label>Note</Label>
        <Input value={value} onChangeText={setValue} />
      </Flex>
      <TouchableArea
        jc={"center"}
        alignItems="center"
        flexDirection="row"
        onPress={() => {
          if (!showForm.edit) {
            createBookmark({ text: value, currentTime: currentPosition });
          } else {
            updateBookmark({ title: value, time: showForm.edit.time });
          }
        }}
        borderColor={"$borderColor"}
        borderWidth="$1"
        borderRadius={"$4"}
        padding="$3"
      >
        <Text>{showForm.edit ? "Update" : "Create"}</Text>
      </TouchableArea>
    </Flex>
  );
};

const Time = ({ big, value }: { big?: boolean; value?: number }) => {
  const { currentPosition } = useAudioPlayerProgress();
  return (
    <Text
      minWidth={!big ? "$5" : undefined}
      color={!big ? "$gray11" : "$color"}
      fontSize={!big ? 12 : 18}
    >
      {formatSeconds(value ?? currentPosition)}
    </Text>
  );
};

const Bookmark = ({
  bookmark,
  color,
  removeBookmark,
  setShowFrom,
}: {
  bookmark: AudioBookmark;
  setShowFrom: (data: ShowForm) => void;
  removeBookmark: (bookmark: AudioBookmark) => Promise<void>;
  color: string;
}) => {
  const { seekTo } = useAudioPlayerProgress();

  return (
    <TouchableArea
      key={bookmark.title}
      flexDirection="row"
      jc={"space-between"}
      flex={1}
      alignItems="center"
      onPress={() => seekTo(bookmark.time)}
    >
      <Flex grow maxWidth={"70%"}>
        <Flex row fill gap="$1" alignItems="center">
          <BookmarkCheck size={"$1"} color={color} />
          <Text numberOfLines={1}>{bookmark.title}</Text>
        </Flex>
        <Flex row gap="$1" alignItems="center">
          <Timer size={"$1"} color={color} />
          <Text numberOfLines={1}>{secondsToTimestamp(bookmark.time)}</Text>
        </Flex>
      </Flex>
      <Flex row shrink alignItems="center" gap="$3">
        <TouchableArea
          onPress={() =>
            setShowFrom({
              open: true,
              edit: { title: bookmark.title, time: bookmark.time },
            })
          }
        >
          <Edit3 size={"$1"} />
        </TouchableArea>
        <TouchableArea
          onPress={() =>
            Alert.alert(
              "Delete bookmark",
              `Are you sure you want to remove bookmark`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Okay",
                  style: "destructive",
                  onPress: async () => await removeBookmark(bookmark),
                },
              ],
              {
                cancelable: true,
              }
            )
          }
        >
          <Trash2 size={"$1"} />
        </TouchableArea>
      </Flex>
    </TouchableArea>
  );
};
