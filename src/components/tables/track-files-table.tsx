import { useState } from "react";
import { ChevronDown } from "@tamagui/lucide-icons";
import {
  Accordion,
  Button,
  H4,
  Paragraph,
  Square,
  Text,
  XStack,
} from "tamagui";

import { AudioTrack } from "../../types/aba";
import { DataTable } from "../custom-components/data-table";

const TrackFilesTable = ({ tracks }: { tracks: AudioTrack[] }) => {
  const [opened, setOpened] = useState("");

  const secondsToTimestamp = (seconds: number) => {
    let _seconds = seconds;
    let _minutes = Math.floor(seconds / 60);
    _seconds -= _minutes * 60;
    const _hours = Math.floor(_minutes / 60);
    _minutes -= _hours * 60;
    _seconds = Math.floor(_seconds);
    if (!_hours) {
      return `${_minutes}:${_seconds.toString().padStart(2, "0")}`;
    }
    return `${_hours}:${_minutes.toString().padStart(2, "0")}:${_seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const renderItem = (track: AudioTrack) => {
    return (
      <XStack ai="center" pos="relative" py="$3" px="$4" key={track.index}>
        <H4
          color="$color"
          fow="700"
          fontFamily="$mono"
          textTransform="none"
          size="$2"
          numberOfLines={2}
          width={200}
        >
          {track.title}
        </H4>
        <XStack pl="$7" flex={1} justifyContent="flex-end">
          <Text>{secondsToTimestamp(track.duration)}</Text>
        </XStack>
      </XStack>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      py="$4"
      value={opened}
      onValueChange={setOpened}
    >
      <Accordion.Item value="a1">
        <Accordion.Trigger
          flexDirection="row"
          justifyContent="space-between"
          borderTopLeftRadius={"$4"}
          borderTopRightRadius={"$4"}
          borderBottomLeftRadius={opened === "a1" ? "$0" : "$4"}
          borderBottomRightRadius={opened === "a1" ? "$0" : "$4"}
        >
          {({ open }: { open: boolean }) => {
            return (
              <>
                <Paragraph space="$4">
                  Tracks
                  <Button size={"$2"} bg={"$gray6"}>
                    <Text>{tracks.length}</Text>
                  </Button>
                </Paragraph>

                <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                  <ChevronDown size="$1" />
                </Square>
              </>
            );
          }}
        </Accordion.Trigger>
        <Accordion.Content padding={false}>
          <XStack w={"100%"}>
            <DataTable title="Tracks" data={tracks} renderItem={renderItem} />
          </XStack>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default TrackFilesTable;
