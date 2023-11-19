import { memo } from "react";
import { FlatList } from "react-native";
import { H3, ListItem, Text } from "tamagui";

import { getBorderRadius } from "../../utils/ui";

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
  return (
    <FlatList
      {...rest}
      style={{ marginBottom: 20 }}
      ListHeaderComponent={() => <H3>{title}</H3>}
      data={data}
      showsVerticalScrollIndicator={false}
      initialNumToRender={data.length}
      renderItem={({ item, index }) => {
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
          <ListItem
            pressTheme={true}
            borderWidth={"$0.5"}
            borderBottomWidth={isLast ? "$0.5" : "$0"}
            onPress={() => onPress && onPress({ item, filter })}
            {...radiusStyles}
          >
            <Text numberOfLines={2}>{item}</Text>
          </ListItem>
        );
      }}
    />
  );
};

export const GenreList = memo(_GenreList);
