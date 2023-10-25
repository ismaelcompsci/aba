import { MoreVertical } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { deviceDataAtom } from "../../state/local-state";
import { ServerConfig } from "../../types/types";
import { ClearIconButton } from "../buttons/button";

const ServerConfigMenu = ({ config }: { config: ServerConfig }) => {
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);

  const onDelete = () => {
    // disconnect socket here

    const sscs = deviceData.serverConnectionConfigs.filter(
      (sc) => config.id !== sc.id
    );

    console.log({ sscs });
    setDeviceData({ ...deviceData, serverConnectionConfigs: sscs });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ClearIconButton>
          <MoreVertical />
        </ClearIconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item key="delete" destructive onSelect={onDelete}>
          <DropdownMenu.ItemTitle>Delete</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ServerConfigMenu;
