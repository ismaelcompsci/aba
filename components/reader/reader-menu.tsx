import { ChevronLeft, List, Settings2 } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Label,
  Separator,
  Switch,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { IconButton } from "../ui/button";
import { BlurView } from "@react-native-community/blur";
import { Theme, useReader } from "../EpubReaderV2";
import { Appearance } from "react-native";
import {
  createThemeForBook,
  darkTheme,
  defaultTheme,
} from "../../utils/themes";

interface ReaderMenuProps {
  children: React.ReactNode;
  hide: boolean;
}

const ReaderMenu = ({ children, hide }: ReaderMenuProps) => {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const theme = Appearance.getColorScheme();
  const { changePageFlow, changeTheme, changeFontSize } = useReader();
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    if (!hide) {
      setOpenSettings(false);
    }
  }, [hide]);

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
            <IconButton icon={<List color={"$blue10Dark"} size={"$1"} />} />
            <IconButton
              // selected={!openSettings}
              backgroundColor={openSettings ? "$blue10Dark" : undefined}
              icon={
                <Settings2
                  color={!openSettings ? "$blue10Dark" : "$background"}
                  size={"$1"}
                />
              }
              onPress={() => setOpenSettings((p) => !p)}
            />
          </XStack>
          {hide && openSettings && (
            <YStack top={"$13"} h={"$20"}>
              <BlurView
                style={{
                  height: "100%",
                }}
                blurType={theme === "light" ? "light" : "extraDark"}
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
              />
              <YStack pos={"absolute"} zIndex={"$3"} p={"$2"} h={"100%"}>
                {/* scrolling view */}
                <XStack alignItems="center" space={"$2"}>
                  <Label>Scrolling View</Label>
                  <Separator minHeight={20} theme={"blue"} vertical />
                  <Switch
                    size={"$3"}
                    checked={scrolled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        changePageFlow("scrolled");
                        setScrolled(true);
                      } else {
                        changePageFlow("paginated");
                        setScrolled(false);
                      }
                    }}
                  >
                    <Switch.Thumb animation={"quick"} />
                  </Switch>
                </XStack>
                {/* font size change */}
                <XStack>
                  <Group
                    orientation="horizontal"
                    separator={
                      <Separator minHeight={20} theme={"blue"} vertical />
                    }
                  >
                    <Group.Item>
                      <Button
                        size={"$3"}
                        // onPress={() => handleFontSizeChange("down")}
                        alignSelf="center"
                        fontSize={"$1"}
                      >
                        A
                      </Button>
                    </Group.Item>
                    <Group.Item>
                      <Button
                        size={"$3"}
                        // onPress={() => handleFontSizeChange("up")}
                        alignSelf="center"
                        fontSize={"$7"}
                      >
                        A
                      </Button>
                    </Group.Item>
                  </Group>
                </XStack>
                {/* Theme change */}
                <XStack>
                  <Button
                    bg={"$gray1Light"}
                    color="black"
                    onPress={() =>
                      changeTheme({
                        backgroundColor: "#fafafa",
                        foregroundColor: "#09090b",
                      })
                    }
                  >
                    A
                  </Button>
                  <Button
                    bg={"black"}
                    color="white"
                    onPress={() =>
                      changeTheme({
                        backgroundColor: "#09090b",
                        foregroundColor: "#fafafa",
                      })
                    }
                  >
                    A
                  </Button>
                </XStack>
              </YStack>
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
