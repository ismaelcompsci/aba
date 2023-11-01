import { memo } from "react";
import { FlatList } from "react-native";
import { H3, ListItem, Text } from "tamagui";

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

type DisablePassBorderRadius = boolean | "bottom" | "top" | "start" | "end";

const getBorderRadius = ({
  isFirst,
  isLast,
  radius,
  vertical,
  disable,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  radius: any;
  vertical: boolean;
  isFirst: boolean;
  isLast: boolean;
  disable: DisablePassBorderRadius;
}) => {
  // TODO: RTL support would be nice here
  return {
    borderTopLeftRadius:
      isFirst && disable !== "top" && disable !== "start" ? radius : 0,
    borderTopRightRadius:
      disable !== "top" &&
      disable !== "end" &&
      ((vertical && isFirst) || (!vertical && isLast))
        ? radius
        : 0,
    borderBottomLeftRadius:
      disable !== "bottom" &&
      disable !== "start" &&
      ((vertical && isLast) || (!vertical && isFirst))
        ? radius
        : 0,
    borderBottomRightRadius:
      isLast && disable !== "bottom" && disable !== "end" ? radius : 0,
  };
};
