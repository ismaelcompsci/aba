import { useState } from "react";
import { ChevronDown } from "@tamagui/lucide-icons";
import {
  Accordion,
  Button,
  H4,
  Paragraph,
  Square,
  Text,
  XStack,
} from "tamagui";

import { BookChapter, LibraryItem } from "../../types/aba";
import { DataTable } from "../custom-components/data-table";

const ChapterFilesTable = ({ libraryItem }: { libraryItem: LibraryItem }) => {
  const [opened, setOpened] = useState("");

  const chapters =
    "chapters" in libraryItem.media ? libraryItem.media.chapters : [];

  const secondsToTimestamp = (seconds: number) => {
    let _seconds = seconds;
    let _minutes = Math.floor(seconds / 60);
    _seconds -= _minutes * 60;
    const _hours = Math.floor(_minutes / 60);
    _minutes -= _hours * 60;
    _seconds = Math.floor(_seconds);
    if (!_hours) {
      return `${_minutes}:${_seconds.toString().padStart(2, "0")}`;
    }
    return `${_hours}:${_minutes.toString().padStart(2, "0")}:${_seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const renderItem = (item: BookChapter) => {
    return (
      <XStack ai="center" pos="relative" py="$3" px="$4" key={item.id}>
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
        <XStack pl="$7" flex={1} justifyContent="flex-end">
          <Text>{secondsToTimestamp(item.start)}</Text>
        </XStack>
      </XStack>
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
              <>
                <Paragraph space="$4">
                  Chapters
                  <Button size={"$2"} bg={"$gray6"}>
                    <Text>{chapters.length}</Text>
                  </Button>
                </Paragraph>

                <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                  <ChevronDown size="$1" />
                </Square>
              </>
            );
          }}
        </Accordion.Trigger>
        <Accordion.Content padding={false}>
          <XStack w={"100%"}>
            <DataTable
              title="Chapters"
              data={chapters}
              renderItem={renderItem}
            />
          </XStack>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default ChapterFilesTable;