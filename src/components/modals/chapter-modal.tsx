import { useWindowDimensions } from "react-native";
import { StretchInY, StretchOutY } from "react-native-reanimated";
import TrackPlayer from "react-native-track-player";
import { atom, useAtom } from "jotai";
import { ScrollView, Text } from "tamagui";

import { AudioPlayerTrackExtra } from "../../types/types";
import { formatSeconds } from "../../utils/utils";
import { useTracks } from "../audio-player/hooks/use-tracks";
import { Modal } from "../custom-components/modal";
import { AnimatedFlex, Flex } from "../layout/flex";

export const chaptersModalAtom = atom({ open: false });

const ChaptersModal = () => {
  const [chaptersModal, setChaptersModal] = useAtom(chaptersModalAtom);
  const { width, height } = useWindowDimensions();
  const { audioTracks, currentTrack } = useTracks();

  const handleChapterPress = (track: AudioPlayerTrackExtra) => {
    TrackPlayer.skip(track.id);
  };

  if (!chaptersModal.open) return null;

  return (
    <Modal
      visible
      animationType="fade"
      dimBackground
      showCloseButton
      hide={() => setChaptersModal({ open: false })}
      title="Chapters"
    >
      <Flex height={height * 0.8} width={width * 0.85} gap="$2">
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {audioTracks?.map((track) => (
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
                {track.title}
              </Text>
              <Text ml="auto">{formatSeconds(track.startOffset)}</Text>
            </Flex>
          ))}
        </ScrollView>
      </Flex>
    </Modal>
  );
};

export default ChaptersModal;
