import { useUserMediaProgress } from "../../hooks/use-user-media-progress";
import { Flex } from "../layout/flex";

export const MiniProgressBar = ({
  itemId,
  episodeId,
  progressBarWidth = 24,
}: {
  itemId: string;
  episodeId?: string;
  progressBarWidth?: number;
}) => {
  const { userProgressPercent } = useUserMediaProgress({
    libraryItemId: itemId,
    episodeId: episodeId,
  });
  const barWidth = progressBarWidth;
  const seenWidth = barWidth * userProgressPercent;

  if (!userProgressPercent) return null;

  return (
    <Flex borderRadius={"$5"} overflow="hidden">
      <Flex w={barWidth} h={5} bg={"$gray11"} borderRadius={"$5"} />
      <Flex
        w={seenWidth}
        h={5}
        bg={"$background"}
        borderRadius={"$5"}
        pos={"absolute"}
      />
    </Flex>
  );
};
