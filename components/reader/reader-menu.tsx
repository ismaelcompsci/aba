import { ChevronLeft, List, Settings2 } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Stack, Text, XStack, YStack } from "tamagui";
import { IconButton } from "../ui/button";
import { BlurView } from "@react-native-community/blur";
import { useReader } from "../EpubReaderV2";

interface ReaderMenuProps {
  children: React.ReactNode;
  hide: boolean;
}

let s = "paginated";
const ReaderMenu = ({ children, hide }: ReaderMenuProps) => {
  const router = useRouter();
  const { changePageFlow } = useReader();
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <YStack
      pos={"relative"}
      h={"100%"}
      w={"100%"}
      alignItems="center"
      justifyContent="center"
    >
      {hide && (
        <YStack
          pos={"absolute"}
          bg={"$background"}
          zIndex={"$1"}
          w={"100%"}
          top={0}
          h={"$10"}
        >
          <XStack
            pos={"absolute"}
            space={"$4"}
            h={"$5"}
            w={"50%"}
            px={"$2.5"}
            zIndex={"$2"}
            b={0}
          >
            <IconButton
              icon={<ChevronLeft size={"$1"} color={"$blue10Dark"} />}
              onPress={() => router.back()}
            />
          </XStack>
          <XStack
            pos={"absolute"}
            space={"$4"}
            h={"$5"}
            w={"50%"}
            px={"$2.5"}
            r={0}
            b={0}
            justifyContent="flex-end"
          >
            <IconButton
              icon={<List color={"$blue10Dark"} size={"$1"} />}
              onPress={() => {
                if (s === "scrolled") {
                  changePageFlow("paginated");
                  s = "paginated";
                } else {
                  changePageFlow("scrolled");
                  s = "scrolled";
                }
              }}
            />
            <IconButton
              icon={<Settings2 color={"$blue10Dark"} size={"$1"} />}
              onPress={() => setOpenSettings((p) => !p)}
            />
          </XStack>
          {hide && openSettings && (
            <YStack top={"$13"}>
              <BlurView
                style={{
                  height: "100%",
                }}
                blurType="extraDark"
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
              />
              <Stack pos={"absolute"} zIndex={"$3"}></Stack>
            </YStack>
          )}
        </YStack>
      )}

      {children}

      {hide && (
        <XStack
          zIndex={50}
          w={"100%"}
          bg={"$background"}
          bottom={0}
          h={"$10"}
          pos={"absolute"}
        >
          <Text>Bottom</Text>
        </XStack>
      )}
    </YStack>
  );
};

export default ReaderMenu;
