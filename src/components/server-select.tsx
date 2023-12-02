import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Popover, PopoverProps, Text, useTheme } from "tamagui";

import {
  changingLibraryAtom,
  currentLibraryAtom,
  currentLibraryIdAtom,
  librariesAtom,
} from "../state/app-state";
import { lastLibraryIdAtom } from "../state/local-state";
import { awaitTimeout } from "../utils/utils";

import { IconButton } from "./buttons/button";
import { Flex } from "./layout/flex";
import { TouchableArea } from "./touchable/touchable-area";
import { iconMap } from "./adbs-icons";

const ServerSelect = ({ ...props }: PopoverProps) => {
  const libraries = useAtomValue(librariesAtom);
  const library = useAtomValue(currentLibraryAtom);
  const setLastLibraryId = useSetAtom(lastLibraryIdAtom);
  const [currentLibraryId, setCurrentLibraryId] = useAtom(currentLibraryIdAtom);
  const setChangingLibrary = useSetAtom(changingLibraryAtom);

  const [open, setOpen] = useState(false);

  const colors = useTheme();
  const Icon = library?.icon ? iconMap[library.icon] : iconMap["database"];

  const onValueChange = async (value: string) => {
    const updatedLib = libraries.find((lib) => lib.name === value);
    if (updatedLib?.id === currentLibraryId) return;
    setChangingLibrary(true);

    if (!updatedLib) {
      setChangingLibrary(false);
      return;
    }

    setOpen(false);
    setCurrentLibraryId(updatedLib?.id);
    setLastLibraryId(updatedLib.id);
    await awaitTimeout(30);
    setChangingLibrary(false);
  };

  return (
    <Popover
      size="$3"
      offset={{
        crossAxis: 20,
        mainAxis: 15,
      }}
      allowFlip
      {...props}
      open={open}
      onOpenChange={setOpen}
    >
      <Popover.Trigger asChild>
        <IconButton
          minWidth={80}
          bordered
          icon={<Icon size={14} color={colors.color.get()} />}
          size="$2"
        >
          <Text
            color={"$colorPress"}
            fontWeight={"$7"}
            numberOfLines={1}
            textAlign="center"
          >
            {library?.name ?? ""}
          </Text>
        </IconButton>
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <Flex space>
          {libraries.map((lib) => {
            const Icon = lib?.icon ? iconMap[lib.icon] : iconMap["database"];

            return (
              <TouchableArea
                key={lib.id}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                onPress={() => onValueChange(lib.name)}
              >
                <Text fontWeight="$7">{lib.name}</Text>
                <Flex minWidth={"$4"} />
                <Icon color={colors.color.get()} size={"$1"} />
              </TouchableArea>
            );
          })}
        </Flex>

        {/* <ToggleGroup
          orientation={"vertical"}
          type={"single"}
          defaultValue={library?.name}
          onValueChange={onValueChange}
          disableDeactivation
          bordered={false}
        >
          {libraries.map((lib) => {
            const Icon = lib?.icon ? iconMap[lib.icon] : iconMap["database"];

            return (
              <ToggleGroup.Item value={lib?.name} key={lib?.id}>
                <Flex
                  row
                  $sm={{
                    width: width * 0.35,
                  }}
                  $gtSm={{ width: width * 0.2 }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontWeight="$7">{lib.name}</Text>
                  <Icon color={colors.color.get()} size={"$1"} />
                </Flex>
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup> */}
      </Popover.Content>
    </Popover>
  );
};
export default ServerSelect;
