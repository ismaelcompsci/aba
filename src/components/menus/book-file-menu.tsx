import { MoreVertical } from "@tamagui/lucide-icons";
import * as DropdownMenu from "zeego/dropdown-menu";

import { ClearIconButton } from "../buttons/button";

const PressBookFileMenu = ({
  onButtonPress,
}: {
  onButtonPress: () => void;
}) => {
  return (
    <DropdownMenu.Root>
      {/* trigger */}
      <DropdownMenu.Trigger asChild>
        <ClearIconButton>
          <MoreVertical />
        </ClearIconButton>
      </DropdownMenu.Trigger>
      {/* content */}
      <DropdownMenu.Content>
        <DropdownMenu.Label>File</DropdownMenu.Label>

        <DropdownMenu.Item key="primary" onSelect={onButtonPress}>
          <DropdownMenu.ItemTitle>Set as primary</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default PressBookFileMenu;
