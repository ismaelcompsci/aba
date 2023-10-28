import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { AnimatePresence, Button, Text, XStack, YStack } from "tamagui";

import { Theme } from "../rn-epub-reader";

import { themes } from "./themes";

const ScrollLabels = ({
  showingNext,
  showingPrev,
  label,
  readerSettings,
}: {
  showingNext: boolean;
  showingPrev: boolean;
  label: string;
  readerSettings: Theme;
}) => {
  const theme = themes.find((t) => t.name === readerSettings.theme);
  return (
    <>
      <AnimatePresence>
        {showingPrev ? (
          <XStack
            zIndex={"$5"}
            animation={"100ms"}
            enterStyle={{
              scale: 1.2,
              y: -100,
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
              y: -100,
              scale: 0.9,
            }}
            pos={"absolute"}
            justifyContent="center"
            top={"$10"}
            left={0}
            right={0}
            margin={"auto"}
          >
            <Button backgroundColor={theme?.fg}>
              <YStack py="$1" justifyContent="center" alignItems="center">
                <ChevronUp size={14} />
                <Text numberOfLines={1} color={theme?.bg}>
                  RELEASE FOR: {label || "previous"}
                </Text>
              </YStack>
            </Button>
          </XStack>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showingNext ? (
          <XStack
            animation={"100ms"}
            enterStyle={{
              scale: 1.2,
              y: 200,
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
              y: 200,
              scale: 0.9,
            }}
            pos={"absolute"}
            justifyContent="center"
            bottom={"$10"}
            zIndex={"$5"}
            left={0}
            right={0}
            margin={"auto"}
          >
            <Button backgroundColor={theme?.fg}>
              <YStack py="$1" justifyContent="center" alignItems="center">
                <Text numberOfLines={1} color={theme?.bg}>
                  RELEASE FOR: {label || "next"}
                </Text>
                <ChevronDown size={14} />
              </YStack>
            </Button>
          </XStack>
        ) : null}
      </AnimatePresence>
    </>
  );
};
export default ScrollLabels;
