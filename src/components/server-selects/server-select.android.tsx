import { useAtomValue, useSetAtom } from "jotai";
import { Text, useTheme } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import {
  changingLibraryAtom,
  currentLibraryAtom,
  currentLibraryIdAtom,
  librariesAtom,
} from "../../state/app-state";
import { lastLibraryIdAtom } from "../../state/local-state";
import { awaitTimeout } from "../../utils/utils";
import { iconMap } from "../adbs-icons";
import { IconButton } from "../buttons/button";

const AndroidServerSelect = () => {
  const libraries = useAtomValue(librariesAtom);
  const library = useAtomValue(currentLibraryAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setChangingLibrary = useSetAtom(changingLibraryAtom);
  const setLastLibraryId = useSetAtom(lastLibraryIdAtom);

  const colors = useTheme();
  const Icon = library?.icon ? iconMap[library.icon] : iconMap["database"];

  const onValueChange = async (value: string) => {
    setChangingLibrary(true);
    const updatedLib = libraries.find((lib) => lib.name === value);

    if (!updatedLib) {
      setChangingLibrary(false);
      return;
    }

    setCurrentLibraryId(updatedLib?.id);
    setLastLibraryId(updatedLib.id);
    await awaitTimeout(50);
    setChangingLibrary(false);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton
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
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {libraries.map((lib) => {
          return (
            <DropdownMenu.Item
              key={lib.id}
              onSelect={() => onValueChange(lib.name)}
            >
              <DropdownMenu.ItemTitle>{lib.name}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default AndroidServerSelect;
