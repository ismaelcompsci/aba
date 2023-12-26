import { MoreVertical } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { showPlayerAtom } from "../../state/app-state";
import { TouchableArea } from "../touchable/touchable-area";

const AudioPlayerMore = ({ closePlayer }: { closePlayer?: () => void }) => {
  const setShowPlayer = useSetAtom(showPlayerAtom);

  const _closePlayer = async () => {
    closePlayer && closePlayer();
    setShowPlayer({ open: true, playing: false });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TouchableArea
          borderRadius={"$12"}
          padding={"$0"}
          width={"$4"}
          height={"$4"}
          alignItems={"center"}
          justifyContent={"center"}
          bg="$background"
        >
          <MoreVertical />
        </TouchableArea>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item key="close" destructive onSelect={_closePlayer}>
          <DropdownMenu.ItemTitle>Close player</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "xmark.circle.fill" }} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default AudioPlayerMore;
