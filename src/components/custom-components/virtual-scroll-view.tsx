import { memo } from "react";
import { FlatList, ScrollViewProps } from "react-native";

const VirtualScrollView = memo((props: ScrollViewProps) => {
  const renderListHeaderComponent = () => {
    return <>{props.children}</>;
  };

  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(_e, i) => "dom" + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      ListHeaderComponent={renderListHeaderComponent}
    />
  );
});

VirtualScrollView.displayName = "VirtualScrollView";
export default VirtualScrollView;
