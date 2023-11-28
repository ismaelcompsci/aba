import { useMemo } from "react";
import CircularProgress, {
  CircularProgressBase,
} from "react-native-circular-progress-indicator";
import {
  CircularProgressBaseProps,
  CircularProgressProps,
} from "react-native-circular-progress-indicator/lib/typescript/types";
import styles from "react-native-circular-progress-indicator/src/circularProgress/styles";
import { CheckCircle } from "@tamagui/lucide-icons";
import { useAtomValue } from "jotai";

import { mediaProgressAtom } from "../state/app-state";
import { PodcastEpisode } from "../types/aba";

import { Flex } from "./layout/flex";

const ItemProgress = ({
  id,
  withText = true,
  showOnlyBase,
  checkMarkSize = 16,
  recentEpisode,
  ...rest
}: {
  id: string;
  withText?: boolean;
  showOnlyBase?: boolean;
  checkMarkSize?: number;
  recentEpisode?: PodcastEpisode;
} & Omit<CircularProgressBaseProps & CircularProgressProps, "value">) => {
  const mediaProgress = useAtomValue(mediaProgressAtom);

  const userMediaProgress = useMemo(() => {
    return mediaProgress?.find((prog) => {
      if (recentEpisode && prog.episodeId !== recentEpisode.id) return false;
      return prog.libraryItemId === id;
    });
  }, [mediaProgress, id]);

  let useEBookProgress;
  if (!userMediaProgress || userMediaProgress.progress)
    useEBookProgress = false;
  else if (userMediaProgress.ebookProgress)
    useEBookProgress = userMediaProgress.ebookProgress > 0;

  let userProgressPercent: number;
  if (useEBookProgress && userMediaProgress?.ebookProgress) {
    userProgressPercent = Math.max(
      Math.min(1, userMediaProgress.ebookProgress),
      0
    );
  } else
    userProgressPercent =
      Math.max(Math.min(1, userMediaProgress?.progress || 0), 0) || 0;

  if (userProgressPercent <= 0 || !userProgressPercent) {
    return null;
  }

  if (withText) {
    return (
      <CircularProgress
        value={userProgressPercent * 100}
        strokeColorConfig={[
          { color: rest.activeStrokeColor || "#2ecc71", value: 0 },
          { color: rest.activeStrokeColor || "#2ecc71", value: 99 },
          { color: "#2ecc71", value: 100 },
        ]}
        {...rest}
      />
    );
  } else
    return (
      // @ts-ignore
      <Flex style={[styles({ radius: rest?.radius }).container]}>
        {userProgressPercent < 1 ? (
          <CircularProgressBase
            value={userProgressPercent * 100}
            strokeColorConfig={[
              { color: rest.activeStrokeColor || "#2ecc71", value: 0 },
              { color: rest.activeStrokeColor || "#2ecc71", value: 99 },
              { color: "#2ecc71", value: 100 },
            ]}
            {...rest}
          />
        ) : showOnlyBase ? null : (
          <CheckCircle size={checkMarkSize} color="#2ecc71" />
        )}
      </Flex>
    );
};

export default ItemProgress;
