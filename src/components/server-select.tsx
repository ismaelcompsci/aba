import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Popover, PopoverProps, Text, useTheme } from "tamagui";

import { IS_ANDROID } from "../constants/consts";
import {
  changingLibraryAtom,
  currentLibraryAtom,
  currentLibraryIdAtom,
  librariesAtom,
} from "../state/app-state";
import { lastLibraryIdAtom } from "../state/local-state";

import { Flex } from "./layout/flex";
import { TouchableArea } from "./touchable/touchable-area";
import { iconMap } from "./adbs-icons";

const ServerSelect = ({ ...props }: PopoverProps) => {
  const libraries = useAtomValue(librariesAtom);
  const library = useAtomValue(currentLibraryAtom);
  const setLastLibraryId = useSetAtom(lastLibraryIdAtom);
  const setChangingLibrary = useSetAtom(changingLibraryAtom);
  const [currentLibraryId, setCurrentLibraryId] = useAtom(currentLibraryIdAtom);

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

    setCurrentLibraryId(updatedLib?.id);
    setLastLibraryId(updatedLib.id);
    setChangingLibrary(false);
  };

  return (
    <Popover
      size="$3"
      offset={{
        mainAxis: IS_ANDROID ? 40 : 10,
      }}
      stayInFrame
      allowFlip
      {...props}
      open={open}
      onOpenChange={setOpen}
    >
      <Popover.Trigger>
        <TouchableArea
          minWidth={80}
          alignItems="center"
          gap="$2"
          borderWidth="$1"
          borderColor="$borderColor"
          justifyContent="center"
          borderRadius="$2"
          px="$2"
          py="$1.5"
          opacity={open ? 0.5 : 1}
          flexDirection="row"
          onPress={() => setOpen(true)}
        >
          <Icon size={14} color={colors.color.get()} />
          <Text
            color={"$colorPress"}
            fontWeight={"$7"}
            numberOfLines={1}
            textAlign="center"
          >
            {library?.name ?? ""}
          </Text>
        </TouchableArea>
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
                opacity={currentLibraryId === lib.id ? 0.2 : 1}
              >
                <Text fontWeight="$7">{lib.name}</Text>
                <Flex minWidth={"$4"} />
                <Icon color={colors.color.get()} size={"$1"} />
              </TouchableArea>
            );
          })}
        </Flex>
      </Popover.Content>
    </Popover>
  );
};
export default ServerSelect;
