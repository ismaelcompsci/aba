import { useMemo } from "react";
import Animated, { StretchInY, StretchOutY } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { useAtomValue, useSetAtom } from "jotai";
import { Separator, styled, Text, XStack, YStack } from "tamagui";

import {
  epubReaderOverviewModalAtom,
  epubReaderTocAtom,
} from "../../../../state/app-state";
import { TocItem, useReader } from "../../rn-epub-reader";

type NewTocItem = {
  href: string;
  id: number;
  label: string;
  data: NewTocItem[];
  depth: number;
};

const Bar = styled(Animated.View, {
  entering: StretchInY,
  exiting: StretchOutY,
});

const TocItemView = ({
  item,
  handleTocItemPress,
}: {
  item: NewTocItem;
  handleTocItemPress: (item: NewTocItem) => void;
}) => {
  const { currentLocation } = useReader();

  return (
    <YStack>
      <XStack
        h="$3"
        ai="center"
        pressStyle={{
          bg: "$backgroundPress",
        }}
        onPress={() => handleTocItemPress(item)}
        bg={
          currentLocation?.tocItem?.id === item.id
            ? "$backgroundPress"
            : "$background"
        }
        borderRadius={"$4"}
        paddingLeft={item.depth * 10}
      >
        {currentLocation?.tocItem?.id === item.id ? (
          <Bar
            bg={"$blue10"}
            br={"$8"}
            t={0}
            l={0}
            b={0}
            r={0}
            w={"$0.5"}
            pos={"absolute"}
          />
        ) : null}
        <XStack paddingHorizontal={"$2"}>
          <Text>{item.label}</Text>
        </XStack>
      </XStack>
      <Separator borderRadius={"$4"} />
    </YStack>
  );
};

export const Content = () => {
  const { goToLocation, currentLocation } = useReader();
  const epubReaderToc = useAtomValue(epubReaderTocAtom);
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const newToc = useMemo(() => flattenTocItems(epubReaderToc || []), []);

  const handleTocItemPress = (item: TocItem) => {
    goToLocation(item.href);
    setEpubReaderOverviewModal(false);
  };

  function flattenTocItems(items: TocItem[]): NewTocItem[] {
    const flattenedItems: NewTocItem[] = [];

    function flatten(item: TocItem, depth: number) {
      const flattenedItem: NewTocItem = {
        href: item.href,
        id: item.id,
        label: item.label,
        data: [],
        depth: depth,
      };

      flattenedItems.push(flattenedItem);

      if (item.subitems && item.subitems.length > 0) {
        item.subitems.forEach((subitem) => flatten(subitem, depth + 1));
      }
    }

    items.forEach((item) => flatten(item, 0));

    return flattenedItems;
  }

  const renderItem = ({ item }: { item: NewTocItem }) => {
    return <TocItemView handleTocItemPress={handleTocItemPress} item={item} />;
  };

  const keyExtractor = (item: NewTocItem, index: number) => {
    return `${index}-${item.id}-${item.label}`;
  };

  return (
    <YStack
      flex={1}
      bg="$background"
      padding={"$4"}
      $platform-android={{
        paddingTop: "$10",
      }}
    >
      {newToc.length ? (
        <FlashList
          data={newToc}
          renderItem={renderItem}
          estimatedItemSize={37}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={currentLocation?.tocItem.id}
        />
      ) : null}
    </YStack>
  );
};
