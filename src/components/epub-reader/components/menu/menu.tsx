import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import { List, Settings2 } from "@tamagui/lucide-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { H6 } from "tamagui";

import { useAppSafeAreas } from "../../../../hooks/use-app-safe-areas";
import {
  epubReaderBookMetadataAtom,
  epubReaderOverviewModalAtom,
  epubReaderShowMenuAtom,
} from "../../../../state/epub-reader-state";
import { BackButton } from "../../../layout/back-header";
import { AnimatedFlex, Flex } from "../../../layout/flex";
import { TouchableArea } from "../../../touchable/touchable-area";

import { BottomMenu } from "./bottom-menu";
import { EbookSettingsMenu } from "./ebook-settings-menu";

export const Menu = () => {
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const show = useAtomValue(epubReaderShowMenuAtom);
  const [openSettings, setOpenSettings] = useState(false);

  const { left, right, top } = useAppSafeAreas();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!show) {
      setOpenSettings(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <AnimatedFlex
        w={width}
        height={104}
        paddingLeft={left}
        paddingRight={right}
        bg={"$background"}
        pos={"absolute"}
        top={0}
        left={0}
        right={0}
        entering={FadeInUp}
        exiting={FadeOutUp}
        alignItems="center"
        pt={top}
      >
        <Flex
          row
          flex={1}
          alignItems="center"
          paddingHorizontal={"$4"}
          pos={"relative"}
        >
          <Flex row flex={1} gap="$4" ai={"center"}>
            <BackButton />
            <ItemTitle />
          </Flex>
          <Flex row alignItems="center" gap={16}>
            <TouchableArea
              hapticFeedback
              onPress={() => setEpubReaderOverviewModal(true)}
            >
              <List />
            </TouchableArea>
            <TouchableArea
              hapticFeedback
              onPress={() => setOpenSettings((p) => !p)}
            >
              <Settings2 />
            </TouchableArea>
          </Flex>
        </Flex>
        <EbookSettingsMenu
          openSettings={openSettings}
          hide={show}
          setOpenSettings={setOpenSettings}
        />
      </AnimatedFlex>

      <AnimatedFlex
        w={width}
        height={104}
        pos={"absolute"}
        bottom={0}
        left={0}
        right={0}
        centered
        entering={FadeInDown}
        exiting={FadeOutDown}
        paddingHorizontal="$4"
        bg="$background"
      >
        <BottomMenu />
      </AnimatedFlex>
    </>
  );
};

const ItemTitle = () => {
  const metadata = useAtomValue(epubReaderBookMetadataAtom);

  return (
    <H6 numberOfLines={1} maxWidth={"75%"}>
      {metadata?.title ?? ""}
    </H6>
  );
};
