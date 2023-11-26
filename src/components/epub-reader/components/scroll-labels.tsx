import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useAtomValue } from "jotai";
import { AnimatePresence, Button, Text, XStack, YStack } from "tamagui";

import { HEADER_HEIGHT } from "../../../hooks/use-app-safe-areas";
import { ebookSettignsAtom } from "../../../state/local-state";

import { themes } from "./themes";

const ScrollLabels = ({
  showingNext,
  showingPrev,
  label,

  menuHidden,
}: {
  showingNext: boolean;
  showingPrev: boolean;
  label: string;

  menuHidden: boolean;
}) => {
  const ebookSettings = useAtomValue(ebookSettignsAtom);

  const theme = themes.find((t) => t.name === ebookSettings.theme);
  return (
    <>
      <AnimatePresence>
        {showingPrev ? (
          <XStack
            zIndex={9999}
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
            top={!menuHidden ? "$10" : HEADER_HEIGHT + 10}
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
            bottom={!menuHidden ? "$10" : HEADER_HEIGHT + 10}
            zIndex={9999}
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
