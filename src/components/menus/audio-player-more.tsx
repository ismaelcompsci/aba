import { MoreVertical } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { useNewUser } from "../../hooks/use-new-user";
import { showPlayerAtom } from "../../state/app-state";
import { TouchableArea } from "../touchable/touchable-area";

//  TODO DEPEND ON SOCKET UPDATINGPROGRESS
const AudioPlayerMore = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const setShowPlayer = useSetAtom(showPlayerAtom);
  const { refreshUser } = useNewUser(true);

  const closePlayer = async () => {
    setOpen(false);
    await refreshUser();
    setShowPlayer({ open: false, playing: false });
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
        <DropdownMenu.Item key="close" destructive onSelect={closePlayer}>
          <DropdownMenu.ItemTitle>Close player</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "xmark.circle.fill" }} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default AudioPlayerMore;
