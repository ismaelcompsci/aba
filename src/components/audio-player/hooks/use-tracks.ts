import { useEffect, useState } from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { atom } from "jotai";

import { playbackSessionAtom } from "../../../state/app-state";
import { AudioPlayerTrack } from "../../../types/types";

export const useTracks = () => {
  const [audioTracks, setAudioTracks] = useState<AudioPlayerTrack[] | null>(
    null
  );
  const [currentTrack, setCurrentTrack] = useState<AudioPlayerTrack | null>(
    null
  );

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged) {
      event.track &&
        setCurrentTrack(event.track as unknown as AudioPlayerTrack);
    }
  });

  const getTracks = async () => {
    const track = await TrackPlayer.getActiveTrack();
    const tracks = await TrackPlayer.getQueue();

    setAudioTracks(tracks as unknown as AudioPlayerTrack[]);
    setCurrentTrack(track ? (track as unknown as AudioPlayerTrack) : null);
  };

  useEffect(() => {
    getTracks();
  }, []);

  return {
    audioTracks,
    currentTrack,
  };
};

export const chaptersAtom = atom((get) => {
  const session = get(playbackSessionAtom);
  return session?.chapters;
});
