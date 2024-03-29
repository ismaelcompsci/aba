import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { Button, Text, useTheme } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

const PlaybackSpeedControls = () => {
  const [on, setOn] = useState("1x");

  const colors = useTheme();

  useEffect(() => {
    const playbackSpeed = Number(on.replace("x", ""));
    TrackPlayer.setRate(playbackSpeed);
  }, [on]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          unstyled
          borderRadius={"$12"}
          padding={"$0"}
          width={"$6"}
          height={"$4"}
          alignItems={"center"}
          justifyContent={"center"}
          pressStyle={{
            opacity: 0.8,
          }}
          accessible
          accessibilityLabel="Speed control"
          accessibilityRole="button"
        >
          <Text
            fontSize={"$6"}
            px="$2"
            py="$1"
            style={
              on != "1x"
                ? {
                    color: colors.color.get(),
                    textShadowColor: colors.color.get(),
                    textShadowOffset: { width: -1, height: 0 },
                    textShadowRadius: 5,
                  }
                : undefined
            }
          >
            {on}
          </Text>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem
          key="0.75x"
          textValue="0.75x"
          value={on === "0.75x"}
          onValueChange={(next) => {
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
          onValueChange={(next) => {
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
          onValueChange={(next) => {
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
          onValueChange={(next) => {
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
          onValueChange={(next) => {
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
          onValueChange={(next) => {
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
