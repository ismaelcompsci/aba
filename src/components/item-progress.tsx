import { useMemo } from "react";
import CircularProgress from "react-native-circular-progress-indicator";
import { CircularProgressProps } from "react-native-circular-progress-indicator/lib/typescript/types";
import { useAtomValue } from "jotai";

import { mediaProgressAtom } from "../state/app-state";

const ItemProgress = ({
  id,
  ...rest
}: { id: string } & Omit<CircularProgressProps, "value">) => {
  const mediaProgress = useAtomValue(mediaProgressAtom);

  const userMediaProgress = useMemo(() => {
    return mediaProgress?.find((prog) => prog.libraryItemId === id);
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

  if (userProgressPercent <= 0 || !userProgressPercent) return null;

  return <CircularProgress {...rest} value={userProgressPercent * 100} />;
};

export default ItemProgress;
