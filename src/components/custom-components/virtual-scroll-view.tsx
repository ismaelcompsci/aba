import { memo } from "react";
import { FlatList, ScrollViewProps } from "react-native";

const VirtualScrollView = memo((props: ScrollViewProps) => {
  return (
    <FlatList
      {...props}
      ListHeaderComponent={<>{props.children}</>}
      data={[]}
      keyExtractor={(): string => "key"}
      keyboardShouldPersistTaps="always"
      renderItem={null}
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
});

VirtualScrollView.displayName = "VirtualScrollView";
export default VirtualScrollView;
