import TrackPlayer, { useProgress } from "react-native-track-player";

import { useTracks } from "./use-tracks";

export const useAudioPlayerProgress = () => {
  const { audioTracks, currentTrack } = useTracks();
  const { position } = useProgress();

  const currentTrackOffset = currentTrack ? currentTrack.startOffset : 0;
  const currentPosition = currentTrackOffset + position;

  const getTotalDuration = () => {
    let total = 0;
    audioTracks?.forEach((t) => (total += t.duration || 0));
    return total;
  };

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
      return await TrackPlayer.seekTo(value - (currentTrack?.startOffset || 0));
    }

    const trackIndex = Math.max(
      0,
      audioTracks.findIndex(
        (t) =>
          Math.floor(t.startOffset) <= value &&
          Math.floor(t.startOffset + (t.duration || 0)) > value
      )
    );

    const initialPosition = value - audioTracks[trackIndex].startOffset;

    await TrackPlayer.pause();
    await TrackPlayer.skip(trackIndex);
    await TrackPlayer.seekTo(initialPosition);
    /**
     * stops the slider from bouncing because it takes a second to update progress from TrackPlayer
     */
    if (timeToCall && cb) {
      TrackPlayer.play().then(() => {
        setTimeout(() => {
          // setIsSeeking(false);
          cb();
        }, timeToCall);
      });
    } else await TrackPlayer.play();
  };

  return {
    currentPosition,
    currentTrack,
    audioTracks,
    getTotalDuration,
    jumpBackwards,
    jumpForwards,
    seekTo,
  };
};
