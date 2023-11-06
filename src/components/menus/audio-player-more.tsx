import { MoreVertical } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { showPlayerAtom } from "../../state/app-state";
import { CirlceButton } from "../audio-player/components/circle-button";

const AudioPlayerMore = () => {
  const setShowPlayer = useSetAtom(showPlayerAtom);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <CirlceButton>
          <MoreVertical />
        </CirlceButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item
          key="close"
          destructive
          onSelect={() => setShowPlayer({ playing: false })}
        >
          <DropdownMenu.ItemTitle>Close player</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "xmark.circle.fill" }} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default AudioPlayerMore;
