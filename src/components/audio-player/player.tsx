import { useRef } from "react";

import { IS_ANDROID } from "../../constants/consts";
import {
  PlayerBottomSheet,
  PlayerBottomSheetRef,
} from "../custom-components/player-bottom-sheet";
import { Flex } from "../layout/flex";

import BigAudioPlayer from "./components/big-audio-player";
import {
  AudiobookInfo,
  AudioPlayerInfo,
} from "./components/small-audio-player";

const INITIAL_HEIGHT = IS_ANDROID ? 80 : 80 + 20;

export const Player = ({
  audiobookInfo,
  libraryItemId,
}: {
  libraryItemId: string;
  audiobookInfo: AudiobookInfo;
}) => {
  const playerRef = useRef<PlayerBottomSheetRef | null>(null);

  return (
    <PlayerBottomSheet
      ref={playerRef}
      initialHeight={INITIAL_HEIGHT}
      HeaderComponent={
        <Flex
          height={64}
          w="100%"
          bg="$backgroundPress"
          borderRadius="$4"
          centered
          px="$2.5"
          onPress={() => playerRef.current?.expand()}
        >
          <Flex
            h={1}
            w={1}
            accessible
            accessibilityLabel="Expand Player Button"
            accessibilityHint="Expand player for more info"
            accessibilityActions={[
              { name: "expand_player", label: "Expand Player" },
            ]}
            onAccessibilityAction={(event) => {
              switch (event.nativeEvent.actionName) {
                case "expand_player":
                  playerRef.current?.expand();
                  break;
                default:
                  break;
              }
            }}
          />
          <AudioPlayerInfo color="white" audiobookInfo={audiobookInfo} />
        </Flex>
      }
      ContentComponent={
        <BigAudioPlayer
          audiobookInfo={audiobookInfo}
          libraryItemId={libraryItemId}
          closePlayer={() => playerRef.current?.collapse()}
        />
      }
    />
  );
};
