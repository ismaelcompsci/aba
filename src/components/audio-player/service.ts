import TrackPlayer, { Event, Track } from "react-native-track-player";

module.exports = async function () {
  let tracks: Track[] | null = null;

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    // console.log("Event.RemoteJumpForward", event);
    await TrackPlayer.seekBy(event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    // console.log("Event.RemoteJumpBackward", event.interval);
    await TrackPlayer.seekBy(-event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
    // console.log("Event.RemoteSeek", event);
    if (!tracks) return;

    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    const currentTrack = currentTrackIndex ? tracks[currentTrackIndex] : null;

    if (!currentTrack || !tracks.length) return;

    const seekToTrackIndex = Math.max(
      0,
      tracks.findIndex(
        (t) =>
          Math.floor(t.startOffset) <= event.position &&
          Math.floor(t.startOffset + (t.duration || 0)) > event.position
      )
    );

    const initialPosition =
      event.position - tracks[seekToTrackIndex].startOffset;
    await TrackPlayer.pause();
    await TrackPlayer.skip(seekToTrackIndex);
    await TrackPlayer.seekTo(initialPosition);
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.MetadataCommonReceived, async (event) => {
    // console.log("Event.MetadataCommonReceived", event);
    tracks = await TrackPlayer.getQueue();
  });
};
