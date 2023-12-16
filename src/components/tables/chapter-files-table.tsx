import { memo, useState } from "react";
import { ChevronDown } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import { Accordion, Button, H4, Paragraph, Square, Text } from "tamagui";

import { showPlayerAtom } from "../../state/app-state";
import { BookChapter, LibraryItem } from "../../types/aba";
import { secondsToTimestamp } from "../../utils/utils";
import { DataTable } from "../custom-components/data-table";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

const ChapterFilesTable = memo(
  ({ libraryItem }: { libraryItem: LibraryItem }) => {
    const [opened, setOpened] = useState("");
    const setShowPlayer = useSetAtom(showPlayerAtom);

    const chapters =
      "chapters" in libraryItem.media ? libraryItem.media.chapters : [];

    const playChapter = (item: BookChapter) => {
      setShowPlayer({
        open: true,
        playing: true,
        libraryItemId: libraryItem.id,
        chapterId: item.id,
        startTime: item.start,
      });
    };

    const renderItem = ({ item }: { item: BookChapter }) => {
      return (
        <Flex row ai="center" pos="relative" py="$3" px="$4" key={item.id}>
          <H4
            color="$color"
            fow="700"
            fontFamily="$mono"
            textTransform="none"
            size="$4"
            numberOfLines={2}
            width={200}
          >
            {item.title}
          </H4>
          <Flex row pl="$7" flex={1} justifyContent="flex-end">
            <TouchableArea onPress={() => playChapter(item)}>
              <Text textDecorationLine="underline">
                {secondsToTimestamp(item.start)}
              </Text>
            </TouchableArea>
          </Flex>
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
                  <Paragraph space="$4">
                    Chapters
                    <Button size={"$2"} bg={"$gray6"}>
                      <Text>{chapters.length}</Text>
                    </Button>
                  </Paragraph>

                  <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                    <ChevronDown size="$1" />
                  </Square>
                </Flex>
              );
            }}
          </Accordion.Trigger>
          <Accordion.Content padding={false}>
            <Flex fill>
              <DataTable
                title="Chapters"
                data={chapters}
                renderItem={renderItem}
              />
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
  }
);
ChapterFilesTable.displayName = "ChapterFilesTable";
export default ChapterFilesTable;
