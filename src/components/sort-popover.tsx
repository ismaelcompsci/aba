import Popover from "react-native-popover-view";
import { ArrowDown, ArrowDownWideNarrow, ArrowUp } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Button, Text, useTheme } from "tamagui";

import { sorts } from "../constants/consts";
import { descOrderAtom, sortAtom } from "../state/local-state";

import { Flex } from "./layout/flex";
import { TouchableArea } from "./touchable/touchable-area";

export function SortSelect() {
  const [orderSort, setSort] = useAtom(sortAtom);
  const [descOrder, setDescOrder] = useAtom(descOrderAtom);

  const colors = useTheme();

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
    <Popover
      popoverStyle={{
        backgroundColor: colors.backgroundPress.get(),
      }}
      from={
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
          accessible
          accessibilityLabel="Sort"
        >
          <ArrowDownWideNarrow />
        </Button>
      }
    >
      <Flex space borderWidth={1} p="$3" borderColor="$borderColor">
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
    </Popover>
    // <Popover
    //   size="$3"
    //   offset={{
    //     mainAxis: IS_ANDROID ? 20 : 0,
    //   }}
    //   {...props}
    // >
    //   <Popover.Trigger asChild>
    // <Button
    //   justifyContent="center"
    //   alignItems="center"
    //   unstyled
    //   pressStyle={{
    //     opacity: 0.7,
    //   }}
    //   height={"$4"}
    //   width={"$4"}
    //   mr="$2"
    //   accessible
    //   accessibilityLabel="Sort"
    // >
    //   <ArrowDownWideNarrow />
    // </Button>
    //   </Popover.Trigger>

    //   <Popover.Content
    //     borderWidth={1}
    //     borderColor="$borderColor"
    //     enterStyle={{ y: -10, opacity: 0 }}
    //     exitStyle={{ y: -10, opacity: 0 }}
    //     elevate
    //     animation={[
    //       "quick",
    //       {
    //         opacity: {
    //           overshootClamping: true,
    //         },
    //       },
    //     ]}
    //   >
    //     <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

    // <Flex space>
    //   {sorts.map((sort) => (
    //     <TouchableArea
    //       key={sort.value}
    //       display="flex"
    //       flexDirection="row"
    //       alignItems="center"
    //       gap="$2"
    //       onPress={() => {
    //         secondPress(sort);
    //         onValueChange(sort.value);
    //       }}
    //     >
    //       <Text>{sort.text}</Text>
    //       {orderSort === sort.value ? (
    //         !descOrder ? (
    //           <ArrowDown size={"$0.75"} />
    //         ) : (
    //           <ArrowUp size={"$0.75"} />
    //         )
    //       ) : null}
    //     </TouchableArea>
    //   ))}
    // </Flex>
    //   </Popover.Content>
    // </Popover>
  );
}
