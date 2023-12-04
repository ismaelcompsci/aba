import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { ChevronDown } from "@tamagui/lucide-icons";
import { Button, Popover, Text } from "tamagui";

import { Folder } from "../../../types/aba";
import { Flex } from "../../layout/flex";
import { TouchableArea } from "../../touchable/touchable-area";

export const PodcastFormFolderMenu = ({
  selectedFolderItem,
  setSelectedFolderItem,
  libraryFolderItems,
}: {
  libraryFolderItems: Folder[];
  selectedFolderItem?: Folder;
  setSelectedFolderItem: (folder: Folder) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <Flex gap="$1">
      <Text fontSize={16} fontWeight={"900"}>
        Folder
      </Text>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        allowFlip
        offset={{
          mainAxis: 5,
        }}
      >
        <Popover.Trigger asChild>
          <Button bg="$gray2" justifyContent="space-between">
            {selectedFolderItem?.fullPath}
            <ChevronDown />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          width="100%"
          bg="$gray2"
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
          <Flex width={width - 44 * 2}>
            {libraryFolderItems?.map((folder) => (
              <TouchableArea
                key={folder.id}
                py="$2"
                onPress={() => {
                  setSelectedFolderItem(folder);
                  setOpen(false);
                }}
              >
                <Text>{folder.fullPath}</Text>
              </TouchableArea>
            ))}
          </Flex>
        </Popover.Content>
      </Popover>
    </Flex>
  );
};
