import { memo } from "react";
import { FlatList, ScrollViewProps } from "react-native";

const VirtualScrollView = memo((props: ScrollViewProps) => {
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
});

VirtualScrollView.displayName = "VirtualScrollView";
export default VirtualScrollView;
