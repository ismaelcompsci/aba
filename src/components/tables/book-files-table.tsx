import { useState } from "react";
import { Dimensions } from "react-native";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  MoreVertical,
} from "@tamagui/lucide-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue } from "jotai";
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
import { Adapt, Popover, PopoverProps } from "tamagui";
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
        { headers: { Authorization: `Bearer ${user?.token}` } }
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
    }
  };

  const renderItem = (item: LibraryFile) => {
    return (
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
              <ClearIconButton>
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
                    <Text>{humanFileSize(item.metadata.size || 0, true)}</Text>
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

          <ContextMenu.Item key="primary" onSelect={() => onButtonPress(item)}>
            <ContextMenu.ItemTitle>Set as primary</ContextMenu.ItemTitle>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
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

// tamagui popover
export function BookFilePopover({
  onButtonPress,
  ...props
}: PopoverProps & {
  onButtonPress: () => void;
}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <ClearIconButton>
          <MoreVertical />
        </ClearIconButton>
      </Popover.Trigger>

      <Adapt when={"xxs"} platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <XStack>
          <Button onPress={onButtonPress}>Set as primary</Button>
        </XStack>
      </Popover.Content>
    </Popover>
  );
}

export default BookFilesTable;
