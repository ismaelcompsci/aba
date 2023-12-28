import { memo, useState } from "react";
import { ChevronDown } from "@tamagui/lucide-icons";
import { Accordion, H4, Square, Text } from "tamagui";

import { AudioTrack } from "../../types/aba";
import { DataTable } from "../custom-components/data-table";
import { Flex } from "../layout/flex";

const TrackFilesTable = memo(({ tracks }: { tracks: AudioTrack[] }) => {
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

  const renderItem = ({ item }: { item: AudioTrack }) => {
    return (
      <Flex row ai="center" pos="relative" py="$3" px="$4" key={item.index}>
        <H4
          color="$color"
          fow="700"
          fontFamily="$mono"
          textTransform="none"
          size="$2"
          numberOfLines={2}
          width={200}
        >
          {item.title}
        </H4>
        <Flex row pl="$7" flex={1} justifyContent="flex-end">
          <Text>{secondsToTimestamp(item.duration)}</Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      pt="$4"
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
              <Flex row fill jc="space-between">
                <Flex row space="$4" alignItems="center">
                  <Text>Tracks</Text>
                  <Flex bg={"$gray6"} px="$2" py="$1.5" borderRadius={"$7"}>
                    <Text>{tracks.length}</Text>
                  </Flex>
                </Flex>

                <Square animation="quick" rotate={open ? "180deg" : "0deg"}>
                  <ChevronDown size="$1" />
                </Square>
              </Flex>
            );
          }}
        </Accordion.Trigger>
        <Accordion.Content padding={false}>
          <Flex fill>
            <DataTable title="Tracks" data={tracks} renderItem={renderItem} />
          </Flex>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
});

TrackFilesTable.displayName = "TrackFilesTable";

export default TrackFilesTable;
