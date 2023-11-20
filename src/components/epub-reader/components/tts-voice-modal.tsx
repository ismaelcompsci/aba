import { useWindowDimensions } from "react-native";
import { ChevronDown, X } from "@tamagui/lucide-icons";
import * as Speech from "expo-speech";
import {
  Button,
  Dialog,
  ListItem,
  ScrollView,
  Separator,
  Text,
  Unspaced,
} from "tamagui";

import { getBorderRadius } from "../../../utils/ui";
import { Flex } from "../../layout/flex";
import { Screen } from "../../layout/screen";

import { Bar } from "./tab-views/content";

const TTSVoiceModal = ({
  voicesModalOpen,
  setVoicesModalOpen,
  voiceList,
  voice,
  setVoice,
}: {
  voice: string;
  voicesModalOpen: boolean;
  setVoicesModalOpen: (open: boolean) => void;
  voiceList: { [lan: string]: Speech.Voice[] };
  setVoice: (voice: string) => void;
}) => {
  const { width, height } = useWindowDimensions();

  const LanguageList = ({
    label,
    items,
  }: {
    label: string;
    items: Speech.Voice[];
  }) => {
    return (
      <>
        <Text pl="$4" color="$gray11" pb="$2">
          {label}{" "}
        </Text>

        {items.length &&
          items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            const radiusStyles = getBorderRadius({
              isFirst,
              isLast,
              radius: "$2",
              vertical: true,
              disable: false,
            });

            return (
              <ListItem
                key={item.identifier}
                h="$3"
                w="100%"
                ai="center"
                borderWidth={"$0.5"}
                borderBottomWidth={isLast ? "$0.5" : "$0"}
                pressStyle={{
                  bg: "$backgroundPress",
                }}
                onPress={() =>
                  item.identifier !== voice && setVoice(item.identifier)
                }
                {...radiusStyles}
              >
                {item.identifier === voice ? (
                  <Bar
                    bg={"$blue10"}
                    br={"$8"}
                    t={0}
                    l={0}
                    b={0}
                    r={0}
                    w={"$0.5"}
                    pos={"absolute"}
                  />
                ) : null}
                <Flex pl="$2">
                  <Text>{item.name}</Text>
                </Flex>
              </ListItem>
            );
          })}
      </>
    );
  };

  return (
    <Dialog
      modal
      open={voicesModalOpen}
      onOpenChange={setVoicesModalOpen}
      disableRemoveScroll
    >
      <Dialog.Trigger asChild>
        <Button
          onPress={() => setVoicesModalOpen(true)}
          iconAfter={ChevronDown}
          jc="space-between"
          $gtSm={{ width: "20%" }}
        >
          <Text>Select Voice</Text>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay-tts"
          animation="100ms"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="tts-content"
          height={height * 0.8}
          width={width * 0.85}
          bordered
          elevate
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <Screen>
            <Flex fill pt="$6">
              <ScrollView
                showsVerticalScrollIndicator={false}
                overflowX="visible"
                space
              >
                <LanguageList
                  items={voiceList["en-AU"]}
                  label="English (Australia)"
                />
                <LanguageList
                  items={voiceList["en-US"]}
                  label="English (United States)"
                />
                <Separator w={0} h="$19" />
              </ScrollView>
            </Flex>
            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  position="absolute"
                  top={0}
                  right={0}
                  size="$2"
                  circular
                  icon={X}
                />
              </Dialog.Close>
            </Unspaced>
          </Screen>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default TTSVoiceModal;
