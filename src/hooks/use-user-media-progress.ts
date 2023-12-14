import { useMemo } from "react";
import { atom, useAtomValue } from "jotai";

import { mediaProgressAtom } from "../state/app-state";

/**
 * https://github.com/pmndrs/jotai/issues/255
 */

export const useUserMediaProgress = ({
  episodeId,
  libraryItemId,
}: {
  episodeId?: string;
  libraryItemId: string;
}) => {
  const userMediaProgress = useAtomValue(
    useMemo(
      () =>
        atom((get) =>
          get(mediaProgressAtom).find((val) => {
            if (episodeId && val?.episodeId !== episodeId) return false;
            return val?.libraryItemId === libraryItemId;
          })
        ),
      [libraryItemId, episodeId]
    )
  );

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
