/**
 * https://github.com/Uniswap/wallet/blob/0339c44a5eb3fe23aeb423186c5de54a6f3cf720/apps/mobile/src/components/layout/VirtualizedList.tsx#L7
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Adds ForwardRef to Animated.FlaList
// https://github.com/software-mansion/react-native-reanimated/issues/2976

import React, { ComponentProps, forwardRef, PropsWithChildren } from "react";
import { FlatList, FlatListProps, LayoutChangeEvent, View } from "react-native";
import Animated, { ILayoutAnimationBuilder } from "react-native-reanimated";

// difficult to properly type
const ReanimatedFlatList = Animated.createAnimatedComponent(
  FlatList as any
) as any;

const AnimatedView = Animated.createAnimatedComponent(View);

const createCellRenderer = (
  itemLayoutAnimation?: ILayoutAnimationBuilder
): React.FC<
  PropsWithChildren<{
    onLayout: (event: LayoutChangeEvent) => void;
  }>
> => {
  const cellRenderer: React.FC<
    PropsWithChildren<{
      onLayout: (event: LayoutChangeEvent) => void;
    }>
  > = (props) => {
    return (
      <AnimatedView
        layout={itemLayoutAnimation as never}
        onLayout={props.onLayout}
      >
        {props.children}
      </AnimatedView>
    );
  };

  return cellRenderer;
};

interface ReanimatedFlatlistProps<T> extends FlatListProps<T> {
  itemLayoutAnimation?: ILayoutAnimationBuilder;
  FlatListComponent?: FlatList;
}

/**
 * Source: https://github.com/software-mansion/react-native-reanimated/blob/main/src/reanimated2/component/FlatList.tsx
 *
 */
export const AnimatedFlatList = forwardRef<
  Animated.FlatList<any>,
  ReanimatedFlatlistProps<any>
>(function _AnimatedFlatList(
  { itemLayoutAnimation, FlatListComponent = ReanimatedFlatList, ...restProps },
  ref
) {
  const cellRenderer = React.useMemo(
    () => createCellRenderer(itemLayoutAnimation),
    []
  );
  return (
    <FlatListComponent
      ref={ref}
      {...restProps}
      CellRendererComponent={cellRenderer}
    />
  );
});

export type VirtualizedListProps = PropsWithChildren<
  Partial<ComponentProps<typeof AnimatedFlatList>>
>;

export const VirtualizedList = forwardRef<any, VirtualizedListProps>(
  function _VirtualizedList({ children, ...props }: VirtualizedListProps, ref) {
    const List = AnimatedFlatList;
    return (
      <List
        {...props}
        ref={ref}
        ListHeaderComponent={<>{children}</>}
        data={[]}
        keyExtractor={(): string => "key"}
        keyboardShouldPersistTaps="always"
        renderItem={null}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);
