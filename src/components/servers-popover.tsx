import { useAtomValue, useSetAtom } from "jotai";
import {
  Adapt,
  Popover,
  PopoverProps,
  Text,
  ToggleGroup,
  XStack,
} from "tamagui";

import useIconTheme from "../hooks/use-icon-theme";
import {
  changingLibraryAtom,
  currentLibraryAtom,
  currentLibraryIdAtom,
  librariesAtom,
} from "../state/app-state";
import { awaitTimeout } from "../utils/utils";

import { IconButton } from "./buttons/button";
import { iconMap } from "./adbs-icons";

export function ServerSelect({ ...props }: PopoverProps) {
  const libraries = useAtomValue(librariesAtom);
  const library = useAtomValue(currentLibraryAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setChangingLibrary = useSetAtom(changingLibraryAtom);

  const { iconColor } = useIconTheme();
  const Icon = library?.icon ? iconMap[library.icon] : iconMap["database"];

  const onValueChange = async (value: string) => {
    setChangingLibrary(true);
    const updatedLib = libraries.find((lib) => lib.name === value);

    if (!updatedLib) {
      setChangingLibrary(false);
      return;
    }

    setCurrentLibraryId(updatedLib?.id);
    await awaitTimeout(50);
    setChangingLibrary(false);
  };

  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <IconButton bordered icon={<Icon size={"$1"} color={iconColor} />}>
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
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>

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

        <ToggleGroup
          orientation={"vertical"}
          type={"single"}
          size={"$3"}
          defaultValue={library?.name}
          onValueChange={onValueChange}
          disableDeactivation
        >
          {libraries.map((lib) => {
            const Icon = lib?.icon ? iconMap[lib.icon] : iconMap["database"];

            return (
              <ToggleGroup.Item value={lib?.name} key={lib?.id}>
                <XStack
                  w={200}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontWeight="$7">{lib.name}</Text>
                  <Icon color={iconColor} size={"$1"} />
                </XStack>
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup>
      </Popover.Content>
    </Popover>
  );
}