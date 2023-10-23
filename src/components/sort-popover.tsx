import { ArrowDown, ArrowUp, ArrowUpDown } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Adapt, Popover, PopoverProps, Text, ToggleGroup } from "tamagui";

import { descOrderAtom, sortAtom } from "../state/local-state";

import { ClearIconButton } from "./buttons/button";

// https://github.com/advplyr/audiobookshelf-app/blob/6b164bdb276b835df9d0dc14bf43c43910009fa9/components/modals/OrderModal.vue#L30C18-L67C8
const sorts = [
  {
    text: "Title",
    value: "media.metadata.title",
  },
  {
    text: "Author (First Last)",
    value: "media.metadata.authorName",
  },
  {
    text: "Author (Last, First)",
    value: "media.metadata.authorNameLF",
  },
  {
    text: "Published Year",
    value: "media.metadata.publishedYear",
  },
  {
    text: "Added At",
    value: "addedAt",
  },
  {
    text: "Size",
    value: "size",
  },
  {
    text: "Duration",
    value: "media.duration",
  },
  {
    text: "File Birthtime",
    value: "birthtimeMs",
  },
  {
    text: "File Modified",
    value: "mtimeMs",
  },
];

export function SortSelect({ ...props }: PopoverProps) {
  const [orderSort, setSort] = useAtom(sortAtom);
  const [descOrder, setDescOrder] = useAtom(descOrderAtom);

  const onValueChange = async (value: string) => {
    setSort(value);
  };

  const secondPress = (sort: { text: string; value: string }) => {
    if (sort.value === orderSort) {
      // @ts-ignore
      setDescOrder((prev) => !prev);
    }
  };

  return (
    <Popover stayInFrame strategy="absolute" size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <ClearIconButton
          height={"$4"}
          justifyContent="center"
          alignItems="center"
        >
          <ArrowUpDown />
        </ClearIconButton>
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
          onValueChange={onValueChange}
          disableDeactivation
          defaultValue={orderSort}
        >
          {sorts.map((sort) => (
            <ToggleGroup.Item
              value={sort.value}
              key={sort.value}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              onPress={() => secondPress(sort)}
            >
              <Text>{sort.text}</Text>
              {orderSort === sort.value ? (
                descOrder ? (
                  <ArrowDown size={"$1"} />
                ) : (
                  <ArrowUp size={"$1"} />
                )
              ) : null}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </Popover.Content>
    </Popover>
  );
}
