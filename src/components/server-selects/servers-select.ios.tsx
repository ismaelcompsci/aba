import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Adapt,
  Popover,
  PopoverProps,
  Text,
  ToggleGroup,
  useTheme,
} from "tamagui";

import {
  changingLibraryAtom,
  currentLibraryAtom,
  currentLibraryIdAtom,
  librariesAtom,
} from "../../state/app-state";
import { awaitTimeout } from "../../utils/utils";
import { iconMap } from "../adbs-icons";
import { IconButton } from "../buttons/button";
import { Flex } from "../layout/flex";

const ServerSelect = ({ ...props }: PopoverProps) => {
  const libraries = useAtomValue(librariesAtom);
  const library = useAtomValue(currentLibraryAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setChangingLibrary = useSetAtom(changingLibraryAtom);

  const [open, setOpen] = useState(false);

  const colors = useTheme();
  const { width } = useWindowDimensions();
  const Icon = library?.icon ? iconMap[library.icon] : iconMap["database"];

  const onValueChange = async (value: string) => {
    setChangingLibrary(true);
    const updatedLib = libraries.find((lib) => lib.name === value);

    if (!updatedLib) {
      setChangingLibrary(false);
      return;
    }

    setOpen(false);
    setCurrentLibraryId(updatedLib?.id);
    await awaitTimeout(30);
    setChangingLibrary(false);
  };

  return (
    <Popover size="$5" allowFlip {...props} open={open} onOpenChange={setOpen}>
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

      <Adapt when={"xxs"} platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame>
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="100ms"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>

      <Popover.Content
        p={"$1"}
        ml={20}
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding={0}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <ToggleGroup
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
        </ToggleGroup>
      </Popover.Content>
    </Popover>
  );
};
export default ServerSelect;
