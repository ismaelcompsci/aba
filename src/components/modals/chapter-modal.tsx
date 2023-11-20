import { useState } from "react";
import { useWindowDimensions } from "react-native";
import TrackPlayer from "react-native-track-player";
import { List, X } from "@tamagui/lucide-icons";
import { Button, Dialog, ScrollView, Text, Unspaced } from "tamagui";

import { AudioPlayerTrackExtra } from "../../types/types";
import { formatSeconds } from "../../utils/utils";
import { CirlceButton } from "../audio-player/components/circle-button";
import { useTracks } from "../audio-player/hooks/use-tracks";
import { Flex } from "../layout/flex";

const ChaptersModal = () => {
  const [openSheet, setOpenSheet] = useState(false);
  const { width, height } = useWindowDimensions();
  const { audioTracks, currentTrack } = useTracks();

  const handleChapterPress = (track: AudioPlayerTrackExtra) => {
    TrackPlayer.skip(track.id);
  };

  return (
    <Dialog
      open={openSheet}
      onOpenChange={setOpenSheet}
      modal
      disableRemoveScroll
    >
      <Dialog.Trigger asChild>
        <CirlceButton
          bg={"$backgroundFocus"}
          zIndex={9999}
          pressStyle={{
            opacity: 0.5,
          }}
        >
          <List />
        </CirlceButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          height={height * 0.8}
          width={width * 0.85}
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
          gap="$2"
        >
          <Dialog.Title>Chapters</Dialog.Title>
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {audioTracks?.map((track, i) => (
              <Flex
                row
                key={track.id}
                height={"$4"}
                ai="center"
                onPress={() => handleChapterPress(track)}
                pressStyle={{
                  bg: "$backgroundPress",
                }}
              >
                {track.id === currentTrack?.id ? (
                  <Flex
                    h={"$2"}
                    w={10}
                    bg={"$blue10"}
                    borderRadius={"$4"}
                    pos={"absolute"}
                    left={0}
                  />
                ) : null}
                <Text pl={"$4"}>
                  {i} - {track.title}
                </Text>
                <Text ml="auto">{formatSeconds(track.startOffset)}</Text>
              </Flex>
            ))}
          </ScrollView>
          <Unspaced>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$3"
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

export default ChaptersModal;
