import { useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, Platform } from "react-native";
import * as Speech from "expo-speech";

import { awaitTimeout } from "../../../utils/utils";
import { useReader } from "../rn-epub-reader";

type TTSState = {
  inProgress: boolean;
  paused: boolean;
  pitch: number;
  rate: number;
  voice: undefined | string;
  language: string;
  text: string | undefined;
  action: string | undefined;
};

const useTTS = () => {
  const state = useRef<TTSState>({
    inProgress: false,
    paused: true,
    pitch: 1,
    rate: 0.75,
    voice: "com.apple.voice.compact.en-AU.Karen",
    language: "en",
    text: undefined,
    action: undefined,
  });

  const skip = useRef(false);

  const [inProgress, setInProgress] = useState(false);
  const [paused, setPaused] = useState(true);
  const [voice, setVoice] = useState("com.apple.voice.compact.en-AU.Karen");
  const [voiceList, setVoiceList] = useState<{
    [voice: string]: Speech.Voice[];
  }>({
    "en-US": [],
    "en-AU": [],
  });

  const {
    setMarkTTS,
    nextTTS,
    initTTS,
    resumeTTS,
    startTTS,
    pauseTTSMark,
    goNext,
  } = useReader();

  const _loadAllVoices = async () => {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    state.current = {
      ...state.current,
      voice: voice,
    };

    const enVoices = availableVoices.filter(
      (value) => value.language === "en-US"
    );

    const auVoices = availableVoices.filter(
      (value) => value.language === "en-AU"
    );

    setVoiceList({
      "en-US": enVoices,
      "en-AU": auVoices,
    });
  };

  const forward = () => {
    initTTS();
    nextTTS(false);
  };

  const speak = async () => {
    if (!state.current.text) {
      goNext();
      await awaitTimeout(100);
      return forward();
    }

    let mark = 0;
    const text = state.current.text?.replace("\r\n.", "\r\n..") + "\r\n.";
    const regex = /<mark\sname="(\d+)"/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    const isPlaying = await Speech.isSpeakingAsync();
    if (isPlaying) {
      /**
       * clearing the queue
       * using the skip because stop() fires the onDone event
       */
      skip.current = true;
      await Speech.stop();
      await Speech.pause();
    }

    if (text) {
      Speech.speak(text, {
        voice: state.current.voice,
        language: state.current.language,
        pitch: state.current.pitch,
        rate: state.current.rate,
        onStart: () => {
          setPaused(false);
        },
        onDone: () => {
          if (skip.current) return;
          if (!skip.current) {
            nextTTS(false);
            skip.current = false;
          }
        },
        /**
         * onMark is only availible on web
         * so we use onBoundry ``
         */
        onBoundary: () => {
          setMarkTTS(`${matches[mark]}`);
          mark++;
          skip.current = false;
        },
      });
    }
  };

  const start = () => {
    initTTS();
    startTTS();
    state.current = { ...state.current, inProgress: true };
    setInProgress(true);
    setPaused(false);
  };

  const stop = () => {
    state.current = {
      ...state.current,
      inProgress: false,
      paused: false,
      text: undefined,
    };
    pauseTTSMark(true);
    setInProgress(false);
    setPaused(true);
    Speech.pause();
  };

  const pause = async () => {
    await Speech.pause();
    state.current = { ...state.current, paused: true };
    pauseTTSMark(false);
    setPaused(true);
  };

  const resume = () => {
    if (!state.current.inProgress) {
      start();
      return Speech.resume();
    }
    resumeTTS();
    Speech.resume();
    state.current = { ...state.current, paused: false };
    setPaused(false);
  };

  const pitch = (pitch: number) => {
    state.current = {
      ...state.current,
      pitch: pitch,
    };
  };

  const rate = (rate: number) => {
    state.current = { ...state.current, rate: rate };
  };

  useEffect(() => {
    (async () => {
      if (inProgress) {
        state.current.voice = voice;
        await pause();
        resume();
      }
    })();
  }, [voice]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    DeviceEventEmitter.addListener("TTS.ssml", async (event) => {
      const { ssml, action } = event;
      state.current = { ...state.current, text: ssml, action: action };
      speak();
    });

    return () => {
      stop();
      state.current = {
        ...state.current,
        inProgress: false,
        paused: false,
        text: undefined,
      };
      DeviceEventEmitter.removeAllListeners("TTS.ssml");
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "ios") {
        await _loadAllVoices();
      }
    })();
  }, []);

  return {
    pause,
    resume,
    inProgress,
    paused,
    stop,
    voiceList,
    setVoice,
    voice,
  };
};

export default useTTS;
