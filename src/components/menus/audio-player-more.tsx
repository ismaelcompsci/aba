import { MoreVertical } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { useNewUser } from "../../hooks/use-new-user";
import { showPlayerAtom } from "../../state/app-state";
import { CirlceButton } from "../audio-player/components/circle-button";

//  TODO DEPEND ON SOCKET UPDATINGPROGRESS
const AudioPlayerMore = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const setShowPlayer = useSetAtom(showPlayerAtom);
  const { refreshUser } = useNewUser(true);

  const closePlayer = async () => {
    setOpen(false);
    await refreshUser();
    setShowPlayer({ playing: false });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <CirlceButton>
          <MoreVertical />
        </CirlceButton>
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
