import { ArrowDown, ArrowDownWideNarrow, ArrowUp } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Button, Popover, PopoverProps, Text } from "tamagui";

import { sorts } from "../constants/consts";
import { descOrderAtom, sortAtom } from "../state/local-state";

import { Flex } from "./layout/flex";
import { TouchableArea } from "./touchable/touchable-area";

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
    <Popover size="$3" {...props}>
      <Popover.Trigger asChild>
        <Button
          justifyContent="center"
          alignItems="center"
          unstyled
          pressStyle={{
            opacity: 0.7,
          }}
          height={"$4"}
          width={"$4"}
          mr="$2"
        >
          <ArrowDownWideNarrow />
        </Button>
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
          {sorts.map((sort) => (
            <TouchableArea
              key={sort.value}
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap="$2"
              onPress={() => {
                secondPress(sort);
                onValueChange(sort.value);
              }}
            >
              <Text>{sort.text}</Text>
              {orderSort === sort.value ? (
                !descOrder ? (
                  <ArrowDown size={"$0.75"} />
                ) : (
                  <ArrowUp size={"$0.75"} />
                )
              ) : null}
            </TouchableArea>
          ))}
        </Flex>
      </Popover.Content>
    </Popover>
  );
}
