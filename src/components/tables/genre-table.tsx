import { memo } from "react";
import { FlatList } from "react-native";
import { H3, ListItem, Text } from "tamagui";

import { getBorderRadius } from "../../utils/ui";
import { TouchableArea } from "../touchable/touchable-area";

const _GenreList = ({
  data,
  title,
  filter,
  onPress,
  ...rest
}: {
  data: string[];
  title: string;
  filter: string;
  onPress?: ({ item, filter }: { item: string; filter: string }) => void;
}) => {
  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    const radiusStyles = getBorderRadius({
      isFirst,
      isLast,
      radius: "$2",
      vertical: true,
      disable: false,
    });

    return (
      <TouchableArea
        hapticFeedback
        flex={1}
        onPress={() => onPress && onPress({ item, filter })}
      >
        <ListItem
          borderWidth={"$0.5"}
          borderBottomWidth={isLast ? "$0.5" : "$0"}
          {...radiusStyles}
        >
          <Text numberOfLines={2}>{item}</Text>
        </ListItem>
      </TouchableArea>
    );
  };
  return (
    <FlatList
      {...rest}
      style={{ marginBottom: 20 }}
      ListHeaderComponent={() => <H3>{title}</H3>}
      data={data}
      showsVerticalScrollIndicator={false}
      initialNumToRender={data.length}
      renderItem={renderItem}
    />
  );
};

export const GenreList = memo(_GenreList);
