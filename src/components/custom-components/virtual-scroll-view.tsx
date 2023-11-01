import { FlatList, ScrollViewProps } from "react-native";

const VirtualScrollView = (props: ScrollViewProps) => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(_e, i) => "dom" + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      ListHeaderComponent={() => <>{props.children}</>}
    />
  );
};

export default VirtualScrollView;
