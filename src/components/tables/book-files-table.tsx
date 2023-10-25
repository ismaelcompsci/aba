import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  MoreVertical,
} from "@tamagui/lucide-icons";
import {
  Accordion,
  Button,
  H4,
  Paragraph,
  Square,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { LibraryFile } from "../../types/aba";

import { ClearIconButton } from "../buttons/button";
import { DataTable } from "../custom-components/data-table";

const BookFilesTable = ({ ebookFiles }: { ebookFiles: LibraryFile[] }) => {
  const [opened, setOpened] = useState("");

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

  const renderItem = (item: LibraryFile) => {
    return (
      <XStack
        ai="center"
        pos="relative"
        py="$3"
        px="$4"
        key={item.metadata.filename}
      >
        <H4
          color="$color"
          fow="700"
          fontFamily="$mono"
          textTransform="none"
          ai="center"
          jc="center"
          textAlign="center"
          size="$4"
          numberOfLines={2}
          width={200}
        >
          {item.metadata.filename}
          {getCheckMark(item)}
        </H4>
        <XStack pl="$7" flex={1} justifyContent="space-between">
          <ClearIconButton>
            <BookOpen />
          </ClearIconButton>
          <ClearIconButton>
            <MoreVertical />
          </ClearIconButton>
        </XStack>
      </XStack>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      py="$4"
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
        <Accordion.Content padding={false}>
          <XStack w={"100%"}>
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
