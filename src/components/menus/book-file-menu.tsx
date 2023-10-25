import { Dimensions } from "react-native";
import { MoreVertical } from "@tamagui/lucide-icons";
import { Button, Text, XStack, YStack } from "tamagui";
import * as ContextMenu from "zeego/context-menu";
import * as DropdownMenu from "zeego/dropdown-menu";

import { LibraryFile } from "../../types/aba";
import { humanFileSize } from "../../utils/utils";
import { ClearIconButton, IconButton } from "../buttons/button";

const BookFileMenu = ({
  item,
  onButtonPress,
}: {
  item: LibraryFile;
  onButtonPress: () => void;
}) => {
  const layout = Dimensions.get("window");

  return (
    <ContextMenu.Root>
      {/* trigger */}
      <ContextMenu.Trigger action="press">
        <ClearIconButton>
          <MoreVertical />
        </ClearIconButton>
      </ContextMenu.Trigger>
      {/* content */}
      <ContextMenu.Content>
        <ContextMenu.Preview>
          {() => (
            <YStack
              bg={"$background"}
              h={"$8"}
              w={layout.width - 50}
              key={item.metadata.filename}
              jc="center"
              alignItems="center"
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

        <ContextMenu.Item key="primary" onSelect={onButtonPress}>
          <ContextMenu.ItemTitle>Set as primary</ContextMenu.ItemTitle>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

// const PressBookFileMenu = ({
//   onButtonPress,
// }: {
//   onButtonPress: () => void;
// }) => {
//   return (
//     <DropdownMenu.Root>
//       {/* trigger */}
//       <DropdownMenu.Trigger asChild>
//         <ClearIconButton>
//           <MoreVertical />
//         </ClearIconButton>
//       </DropdownMenu.Trigger>
//       {/* content */}
//       <DropdownMenu.Content>
//         <DropdownMenu.Label>File</DropdownMenu.Label>

//         <DropdownMenu.Item key="primary" onSelect={onButtonPress}>
//           <DropdownMenu.ItemTitle>Set as primary</DropdownMenu.ItemTitle>
//         </DropdownMenu.Item>
//       </DropdownMenu.Content>
//     </DropdownMenu.Root>
//   );
// };

export default BookFileMenu;
