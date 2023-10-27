import { Progress, Text, XStack } from "tamagui";

import { EpubReaderLoading } from "../types/types";

import { ScreenCenter } from "./center";

const LoadingBook = ({ info }: { info: EpubReaderLoading }) => {
  return (
    <ScreenCenter
      paddingBottom={0}
      px="$8"
      space="$4"
      pos="absolute"
      zIndex={99999}
    >
      <XStack gap="$4" ai="center">
        {info.percent ? (
          <Progress value={info.percent ? info.percent * 100 : 0}>
            <Progress.Indicator animation="bouncy" />
          </Progress>
        ) : null}
        <Text>{info.percent ? Math.trunc(info.percent * 100) : 0}%</Text>
      </XStack>
      <Text>{info.part}...</Text>
    </ScreenCenter>
  );
};

export default LoadingBook;
