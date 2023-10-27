import { Progress, Text, XStack } from "tamagui";

import { EpubReaderLoading } from "../types/types";

import { ScreenCenter } from "./center";

const LoadingBook = ({ info }: { info: EpubReaderLoading }) => {
  return (
    <ScreenCenter paddingBottom={0} px="$8" space="$4" pos="absolute">
      <XStack gap="$4" ai="center">
        <Progress value={info.percent ? info.percent * 100 : 0}>
          <Progress.Indicator animation="bouncy" />
        </Progress>
        <Text>{info.percent ? Math.trunc(info.percent * 100) : 0}%</Text>
      </XStack>
      <Text>{info.part}...</Text>
    </ScreenCenter>
  );
};

export default LoadingBook;
