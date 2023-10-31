import { useState } from "react";
import { Dimensions } from "react-native";
import { BookOpen, CheckCircle, ChevronDown } from "@tamagui/lucide-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import {
  Accordion,
  Button,
  H4,
  ListItem,
  Paragraph,
  Square,
  Text,
  XStack,
  YStack,
} from "tamagui";
import * as ContextMenu from "zeego/context-menu";

import { currentLibraryAtom, userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { LibraryFile } from "../../types/aba";
import { humanFileSize } from "../../utils/utils";
import { ClearIconButton } from "../buttons/button";
import { DataTable } from "../custom-components/data-table";
import PressBookFileMenu from "../menus/book-file-menu";

const BookFilesTable = ({
  ebookFiles,
  itemId,
}: {
  ebookFiles: LibraryFile[];
  itemId: string;
}) => {
  const layout = Dimensions.get("window");
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const library = useAtomValue(currentLibraryAtom);
  const [opened, setOpened] = useState("");

  const userCanUpdate = user?.permissions.update;
  const isAudiobooksOnly = library?.settings.audiobooksOnly;

  const { mutate: updatePrimaryFile } = useMutation({
    mutationKey: ["primary-file"],
    mutationFn: async (item: LibraryFile) => {
      const response = await axios.patch(
        `${serverConfig.serverAddress}/api/items/${itemId}/ebook/${item.ino}/status`,
        null,
        { headers: { Authorization: `Bearer ${user?.token}` }, timeout: 5000 }
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
        <YStack pl={"$2"}>
          <CheckCircle color="$green10" size={"$1"} />
        </YStack>
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

  const renderItem = ({ item }: { item: LibraryFile }) => {
    return (
      <ListItem p={0}>
        <ContextMenu.Root style={{ width: "100%" }}>
          <ContextMenu.Trigger action="press" asChild>
            <XStack
              ai="center"
              pos="relative"
              py="$3"
              px="$4"
              key={item.metadata.filename}
              w={"100%"}
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
                maxWidth={layout.width / 2 + 40}
              >
                {item.metadata.filename}
                {getCheckMark(item)}
              </H4>
              <XStack pr={0} flex={1} justifyContent="flex-end">
                <ClearIconButton onPress={() => onBookOpenPressed(item)}>
                  <BookOpen />
                </ClearIconButton>
                <PressBookFileMenu onButtonPress={() => onButtonPress(item)} />
              </XStack>
            </XStack>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Preview size="INHERIT">
              {() => (
                <YStack
                  bg={"$background"}
                  h={"$9"}
                  w={layout.width - 50}
                  key={item.metadata.filename}
                  jc="center"
                  space="$1"
                  px="$4"
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
                  <XStack ai="center" justifyContent="space-between" w={"100%"}>
                    <YStack space={"$1"}>
                      <Text fontSize={"$2"} color={"$gray9"}>
                        Size
                      </Text>
                      <Text>
                        {humanFileSize(item.metadata.size || 0, true)}
                      </Text>
                    </YStack>
                    <YStack space={"$1"}>
                      <Text fontSize={"$2"} color={"$gray9"}>
                        Format
                      </Text>
                      <Text>{item.metadata.ext.toUpperCase()}</Text>
                    </YStack>
                  </XStack>
                </YStack>
              )}
            </ContextMenu.Preview>
            <ContextMenu.Label>File</ContextMenu.Label>

            <ContextMenu.Item
              key="primary"
              onSelect={() => onButtonPress(item)}
            >
              <ContextMenu.ItemTitle>Set as primary</ContextMenu.ItemTitle>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </ListItem>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      pt="$4"
      value={opened}
      onValueChange={setOpened}
      maxWidth={layout.width}
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
              <>
                <Paragraph space="$4">
                  Ebook Files
                  <Button size={"$2"} bg={"$gray6"}>
                    <Text>{ebookFiles.length}</Text>
                  </Button>
                </Paragraph>

                <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                  <ChevronDown size="$1" />
                </Square>
              </>
            );
          }}
        </Accordion.Trigger>
        <Accordion.Content padding={false} maxWidth={layout.width}>
          <XStack maxWidth={layout.width}>
            <DataTable
              title="Files"
              data={ebookFiles}
              renderItem={renderItem}
            />
          </XStack>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default BookFilesTable;
