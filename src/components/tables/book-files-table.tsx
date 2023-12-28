import { memo, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { BookOpen, CheckCircle, ChevronDown } from "@tamagui/lucide-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { Accordion, H4, Square, Text } from "tamagui";
import * as ContextMenu from "zeego/context-menu";

import {
  currentItemAtom,
  currentLibraryAtom,
  serverAddressAtom,
  userAtom,
  userTokenAtom,
} from "../../state/app-state";
import { LibraryFile } from "../../types/aba";
import { humanFileSize } from "../../utils/utils";
import { ClearIconButton } from "../buttons/button";
import { DataTable } from "../custom-components/data-table";
import { Flex } from "../layout/flex";
import PressBookFileMenu from "../menus/book-file-menu";

const userCanUpdateAtom = selectAtom(
  userAtom,
  (user) => user?.permissions.update
);

const BookFilesTable = () => {
  const { width } = useWindowDimensions();
  const currentItem = useAtomValue(currentItemAtom);

  const queryClient = useQueryClient();
  const userCanUpdate = useAtomValue(userCanUpdateAtom);
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const library = useAtomValue(currentLibraryAtom);
  const [opened, setOpened] = useState("");

  const isAudiobooksOnly = library?.settings.audiobooksOnly;

  const libraryFiles = currentItem?.libraryFiles || [];
  const ebookFiles = useMemo(
    () => libraryFiles.filter((lf) => lf.fileType === "ebook"),
    [currentItem?.id, currentItem?.libraryFiles]
  );
  const itemId = currentItem?.id;

  const { mutate: updatePrimaryFile } = useMutation({
    mutationKey: ["primary-file"],
    mutationFn: async (item: LibraryFile) => {
      const response = await axios.patch(
        `${serverAddress}/api/items/${itemId}/ebook/${item.ino}/status`,
        null,
        { headers: { Authorization: `Bearer ${userToken}` }, timeout: 5000 }
      );

      return response.data;
    },
    onSuccess: () => {
      Burnt.toast({ title: "Ebook updated" });
      queryClient.invalidateQueries({
        queryKey: ["bookItem"],
      });
    },
  });

  const getCheckMark = (item: LibraryFile) => {
    if ("isSupplementary" in item && item.isSupplementary === false) {
      return (
        <Flex pl={"$2"}>
          <CheckCircle color="$green10" size={"$1"} />
        </Flex>
      );
    }

    return null;
  };

  const onButtonPress = (item: LibraryFile) => {
    if (userCanUpdate && !isAudiobooksOnly) {
      updatePrimaryFile(item);
    } else {
      Burnt.toast({
        title: "You do not have permission.",
        preset: "error",
        haptic: "error",
      });
    }
  };
  const onBookOpenPressed = (item: LibraryFile) => {
    router.push(`/reader/${itemId}?ino=${item.ino}`);
  };

  if (!ebookFiles.length) return null;

  const Preview = ({ item }: { item: LibraryFile }) => {
    return (
      <Flex
        width={300}
        key={item.metadata.filename}
        jc="center"
        space="$1"
        p="$4"
        bg="$background"
      >
        <Text
          numberOfLines={2}
          color="$color"
          fow="700"
          fontFamily="$mono"
          textTransform="none"
          fontSize={"$2"}
        >
          {item.metadata.filename}
        </Text>
        <Flex
          row
          ai="center"
          justifyContent="space-between"
          w={"100%"}
          bg="$background"
        >
          <Flex space={"$1"}>
            <Text fontSize={"$2"} color={"$gray9"}>
              Size
            </Text>
            <Text>{humanFileSize(item.metadata.size || 0, true)}</Text>
          </Flex>
          <Flex space={"$1"}>
            <Text fontSize={"$2"} color={"$gray9"}>
              Format
            </Text>
            <Text>{item.metadata.ext.toUpperCase()}</Text>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  // const getPreview = (item: LibraryFile) => {
  //   return <Preview item={item} />;
  // };

  const renderItem = ({ item }: { item: LibraryFile }) => {
    return (
      <Flex p={0} flex={1}>
        <ContextMenu.Root style={{ width: width }}>
          <ContextMenu.Trigger action="press">
            <Flex
              row
              ai="center"
              pos="relative"
              py="$3"
              px="$4"
              key={item.metadata.filename}
              bg={"$background"}
            >
              <H4
                color="$color"
                fow="700"
                fontFamily="$mono"
                textTransform="none"
                fontSize={"$2"}
                ai="center"
                jc="center"
                size="$4"
                numberOfLines={2}
                maxWidth={width / 2 + 40}
              >
                {item.metadata.filename}
                {getCheckMark(item)}
              </H4>
              <Flex row pr={0} fill justifyContent="flex-end">
                <ClearIconButton onPress={() => onBookOpenPressed(item)}>
                  <BookOpen />
                </ClearIconButton>
                <PressBookFileMenu onButtonPress={() => onButtonPress(item)} />
              </Flex>
            </Flex>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            {/* <ContextMenu.Preview size="INHERIT">
              {getPreview(item)}
            </ContextMenu.Preview> */}
            <ContextMenu.Label>File</ContextMenu.Label>

            <ContextMenu.Item
              key="primary"
              onSelect={() => onButtonPress(item)}
            >
              <ContextMenu.ItemTitle>Set as primary</ContextMenu.ItemTitle>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </Flex>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      pt="$4"
      value={opened}
      onValueChange={setOpened}
      maxWidth={width}
    >
      <Accordion.Item value="a1">
        <Accordion.Trigger
          flexDirection="row"
          justifyContent="space-between"
          borderTopLeftRadius={"$4"}
          borderTopRightRadius={"$4"}
          borderBottomLeftRadius={opened === "a1" ? "$0" : "$4"}
          borderBottomRightRadius={opened === "a1" ? "$0" : "$4"}
        >
          {({ open }: { open: boolean }) => {
            return (
              <Flex row fill jc="space-between">
                <Flex row space="$4" alignItems="center">
                  <Text>Ebook files</Text>
                  <Flex bg={"$gray6"} px="$2" py="$1.5" borderRadius={"$7"}>
                    <Text>{ebookFiles.length}</Text>
                  </Flex>
                </Flex>

                <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                  <ChevronDown size="$1" />
                </Square>
              </Flex>
            );
          }}
        </Accordion.Trigger>
        <Accordion.Content padding={false} maxWidth={width}>
          <Flex maxWidth={width}>
            <DataTable
              title="Files"
              data={ebookFiles}
              renderItem={renderItem}
            />
          </Flex>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default memo(BookFilesTable);
