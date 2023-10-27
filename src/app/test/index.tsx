import CircularProgress from "react-native-circular-progress-indicator";
import { Button, Text } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import { ScreenCenter } from "../../components/center";

export const DropdownMenuRoot = DropdownMenu.Root;
export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent = DropdownMenu.Content;
export const DropdownMenuItemTitle = DropdownMenu.ItemTitle;

export const DropdownMenuItem = DropdownMenu.Item;

const TestPage = () => {
  return (
    <ScreenCenter>
      <CircularProgress
        value={58}
        radius={20}
        activeStrokeWidth={4}
        inActiveStrokeWidth={5}
      />
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem key="fernando rojo">
            <DropdownMenuItemTitle>Fernando Rojo</DropdownMenuItemTitle>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Hello</DropdownMenu.Label>
          <DropdownMenu.Item key="2">
            <DropdownMenu.ItemTitle>2</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Group>
            <DropdownMenu.Item key="3">
              <DropdownMenuItemTitle>Me key 3</DropdownMenuItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.CheckboxItem value="on" key="4">
            <DropdownMenuItemTitle>Me key 3</DropdownMenuItemTitle>
            <DropdownMenu.ItemIndicator />
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger key="sub">
              <DropdownMenuItemTitle>Me key 3</DropdownMenuItemTitle>
              <Text>SUB EMNU</Text>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <Text>SUBMENU CONTENT</Text>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Arrow />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ScreenCenter>
  );
};

export default TestPage;
