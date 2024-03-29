import { useRef, useState } from "react";
import TrackPlayer, {
  Event,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { atom, useAtomValue } from "jotai";

import { playbackSessionAtom } from "../../../state/app-state";

import { useTracks } from "./use-tracks";

const durationAtom = atom((get) => get(playbackSessionAtom)?.duration ?? 0);

export const useAudioPlayerProgress = () => {
  const duration = useAtomValue(durationAtom);
  const { audioTracks, currentTrack } = useTracks();
  const { position } = useProgress();

  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrackOffset = currentTrack ? currentTrack.startOffset : 0;
  const currentPosition = currentTrackOffset + position;

  useTrackPlayerEvents([Event.PlaybackQueueEnded], (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      const lastTrack = audioTracks && audioTracks[audioTracks?.length - 1];
      if (lastTrack?.id !== event.track) return;
      setIsFinished(true);
    }
  });

  /**
   *
   * @param timeJump is a positive number
   * @example jumpBackwards(30) // jumps backwards 30 seconds
   */
  const jumpBackwards = async (timeJump: number) => {
    await jump(-timeJump);
  };

  /**
   *
   * @param timeJump is a positive number
   * @example jumpForwards(30) // jumps forwards 30 seconds
   */
  const jumpForwards = async (timeJump: number) => {
    await jump(timeJump);
  };

  const jump = async (jump: number) => {
    if (!audioTracks) return;
    const value = Math.max(0, currentPosition + jump);

    if (
      Math.floor(currentTrack?.startOffset || 0) <= value &&
      Math.floor(
        (currentTrack?.startOffset || 0) + (currentTrack?.duration || 0)
      ) > value
    ) {
      TrackPlayer.setPlayWhenReady;
      await TrackPlayer.seekTo(value - (currentTrack?.startOffset || 0));
    } else {
      const trackIndex = Math.max(
        0,
        audioTracks.findIndex(
          (t) =>
            Math.floor(t.startOffset) <= value &&
            Math.floor(t.startOffset + (t.duration || 0)) > value
        )
      );

      const initialPosition = value - audioTracks[trackIndex].startOffset;

      await TrackPlayer.skip(trackIndex, initialPosition);
    }
  };

  /**
   * @param value seeks to this number in overall duration
   * @param timeToCall when to fire callback
   * @param cb callback to fire when timeToCall timer is done
   * @example seekTo(value, 1250, () => setIsSeeking(false));
   */
  const seekTo = async (
    value: number,
    timeToCall?: number,
    cb?: () => void
  ) => {
    if (!audioTracks?.length) return;

    if (
      Math.floor(currentTrack?.startOffset || 0) <= value &&
      Math.floor(
        (currentTrack?.startOffset || 0) + (currentTrack?.duration || 0)
      ) > value
    ) {
      await TrackPlayer.seekTo(value - (currentTrack?.startOffset || 0));
    } else {
      const trackIndex = Math.max(
        0,
        audioTracks.findIndex(
          (t) =>
            Math.floor(t.startOffset) <= value &&
            Math.floor(t.startOffset + (t.duration || 0)) > value
        )
      );

      const initialPosition = value - audioTracks[trackIndex].startOffset;

      await TrackPlayer.skip(trackIndex, initialPosition);
    }

    timerRef.current && clearTimeout(timerRef.current);
    /**
     * stops the slider from bouncing because it takes a second to update progress from TrackPlayer
     */
    if (timeToCall && cb) {
      TrackPlayer.play().then(() => {
        timerRef.current = setTimeout(() => {
          cb();
        }, timeToCall);
      });
    } else await TrackPlayer.play();
  };

  return {
    isFinished,
    currentPosition,
    currentTrack,
    audioTracks,
    duration,
    jumpBackwards,
    jumpForwards,
    seekTo,
  };
};
