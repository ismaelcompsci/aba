import TrackPlayer, { Event } from "react-native-track-player";

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  // TrackPlayer.addEventListener(Event.RemoteNext, () =>
  //   TrackPlayer.skipToNext()
  // );
  // TrackPlayer.addEventListener(Event.RemotePrevious, () =>
  //   TrackPlayer.skipToPrevious()
  // );
  // TrackPlayer.addEventListener(Event.RemoteNext, () => {
  //   console.log("Event.RemoteNext");
  //   TrackPlayer.skipToNext();
  // });

  // TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
  //   console.log("Event.RemoteJumpForward", event);
  //   TrackPlayer.seekBy(event.interval);
  // });

  // TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
  //   console.log("Event.RemoteJumpBackward", event);
  //   TrackPlayer.seekBy(-event.interval);
  // });

  // TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
  //   console.log("Event.RemoteSeek", event);
  //   // TrackPlayer.seekTo(event.position);
  //   // const listenerCount = DeviceEventEmitter.listenerCount("remote-seek");
  //   // console.log(listenerCount);
  //   // if (!listenerCount) return;
  // });

  // TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
  //   console.log("Event.RemoteDuck", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
  //   console.log("Event.PlaybackQueueEnded", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
  //   console.log("Event.PlaybackActiveTrackChanged", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, (event) => {
  //   console.log("Event.PlaybackPlayWhenReadyChanged", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
  //   console.log("Event.PlaybackState", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (event) => {
  //   console.log("[Deprecated] Event.PlaybackMetadataReceived", event);
  // });

  // TrackPlayer.addEventListener(Event.MetadataChapterReceived, (event) => {
  //   console.log("Event.MetadataChapterReceived", event);
  // });

  // TrackPlayer.addEventListener(Event.MetadataTimedReceived, (event) => {
  //   console.log("Event.MetadataTimedReceived", event);
  // });

  // TrackPlayer.addEventListener(Event.MetadataCommonReceived, (event) => {
  //   console.log("Event.MetadataCommonReceived", event);
  // });

  // TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
  //   console.log("Event.PlaybackProgressUpdated", event);
  // });
};
