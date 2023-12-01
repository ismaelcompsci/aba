import { useMemo } from "react";
import { useAtomValue } from "jotai";

import { mediaProgressAtom } from "../state/app-state";

export const useUserMediaProgress = ({
  episodeId,
  libraryItemId,
}: {
  episodeId?: string;
  libraryItemId: string;
}) => {
  const mediaProgress = useAtomValue(mediaProgressAtom);

  const userMediaProgress = useMemo(() => {
    return mediaProgress?.find((prog) => {
      if (episodeId && prog.episodeId !== episodeId) return false;
      return prog.libraryItemId === libraryItemId;
    });
  }, [mediaProgress, libraryItemId]);

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

  return useMemo(
    () => ({
      userProgressPercent: userProgressPercent ? userProgressPercent : 0,
      userMediaProgress,
    }),
    [userProgressPercent, userMediaProgress]
  );
};
