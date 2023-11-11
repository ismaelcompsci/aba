import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { Text } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import { CirlceButton } from "./circle-button";

const PlaybackSpeedControls = () => {
  const [on, setOn] = useState("1x");

  useEffect(() => {
    const playbackSpeed = Number(on.replace("x", ""));
    TrackPlayer.setRate(playbackSpeed);
  }, [on]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <CirlceButton bg={"$backgroundFocus"}>
          <Text fontSize={"$5"}>{on}</Text>
        </CirlceButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem
          key="0.75x"
          textValue="0.75x"
          value={on === "0.75x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("0.75x");
            }
          }}
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="1x"
          value={on === "1x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("1x");
            }
          }}
          textValue="1x"
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="1.25x"
          value={on === "1.25x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("1.25x");
            }
          }}
          textValue="1.25x"
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="1.50x"
          value={on === "1.50x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("1.50x");
            }
          }}
          textValue="1.50x"
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="1.75x"
          value={on === "1.75x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("1.75x");
            }
          }}
          textValue="1.75x"
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="2x"
          value={on === "2x"}
          onValueChange={(next, previous) => {
            if (next === "on") {
              setOn("2x");
            }
          }}
          textValue="2x"
        >
          <DropdownMenu.ItemIndicator></DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default PlaybackSpeedControls;
