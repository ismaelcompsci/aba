import { useWindowDimensions } from "react-native";
import { StretchInY, StretchOutY } from "react-native-reanimated";
import TrackPlayer from "react-native-track-player";
import { FlashList } from "@shopify/flash-list";
import { X } from "@tamagui/lucide-icons";
import { atom, useAtom, useAtomValue } from "jotai";
import { Button, Dialog, Text, Unspaced } from "tamagui";

import { BookChapter } from "../../types/aba";
import { secondsToTimestamp } from "../../utils/utils";
import { chaptersAtom, useTracks } from "../audio-player/hooks/use-tracks";
import { AnimatedFlex, Flex } from "../layout/flex";

export const chaptersModalAtom = atom({ open: false });

const ChaptersModal = () => {
  const [chaptersModal, setChaptersModal] = useAtom(chaptersModalAtom);

  return (
    <Dialog
      modal
      open={chaptersModal.open}
      onOpenChange={(open) => {
        setChaptersModal({ open: open });
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          pt="$8"
        >
          <Chapters />
          <Unspaced>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$2"
                circular
                icon={X}
              />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

const Chapters = () => {
  const chapters = useAtomValue(chaptersAtom);
  const { width, height } = useWindowDimensions();
  const { audioTracks, currentTrack } = useTracks();

  const tracks =
    ((audioTracks?.length ?? 0) > 1 ? audioTracks : chapters) ?? [];

  const handleChapterPress = (track: BookChapter) => {
    if (track.start) {
      TrackPlayer.seekTo(track.start);
    } else {
      TrackPlayer.skip(track.id);
    }
  };

  return (
    <Flex height={height * 0.7} width={width * 0.85} gap="$2">
      {currentTrack ? (
        <FlashList
          // @ts-ignore
          data={tracks}
          initialScrollIndex={currentTrack.id}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={44}
          renderItem={({ item }) => {
            const start = (
              "startOffset" in item ? item.startOffset : item.start
            ) as number;
            const isPodcastChapter = !("startOffset" in item);

            return (
              <Flex
                row
                key={item.id}
                height={"$4"}
                ai="center"
                onPress={() => handleChapterPress(item)}
                pressStyle={{
                  bg: "$backgroundPress",
                }}
              >
                {item.id === currentTrack?.id && !isPodcastChapter ? (
                  <AnimatedFlex
                    entering={StretchInY.springify()}
                    exiting={StretchOutY.duration(100)}
                    h={"$2"}
                    w={10}
                    bg={"$blue10"}
                    borderRadius={"$4"}
                    pos={"absolute"}
                    left={0}
                  />
                ) : null}
                <Text numberOfLines={1} pl={"$4"} maxWidth={"75%"}>
                  {item.title}
                </Text>
                <Text ml="auto">{secondsToTimestamp(start)}</Text>
              </Flex>
            );
          }}
        />
      ) : null}
    </Flex>
  );
};

export default ChaptersModal;
