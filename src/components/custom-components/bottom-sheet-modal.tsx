/**
 * forked from here ->
 * https://github.com/Uniswap/wallet/blob/main/apps/mobile/src/components/modals/BottomSheetModal.tsx#L196
 */
import { forwardRef, PropsWithChildren, useCallback } from "react";
import {
  FlexStyle,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ColorTokens, useTheme } from "tamagui";

import { IS_ANDROID } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { Flex } from "../layout/flex";

type Props = PropsWithChildren<{
  onClose?: () => void;
  renderBehindTopInset?: boolean;
  hideHandlebar?: boolean;
  fullScreen?: boolean;
}>;

// export const AppBottomSheetModalR = BottomSheet;

export const AppBottomSheetModal = forwardRef<BottomSheet, Props>(
  (
    {
      children,
      onClose,
      renderBehindTopInset = false,
      hideHandlebar,
      fullScreen,
    },
    ref
  ) => {
    const dimensions = useWindowDimensions();
    const colors = useTheme();

    // const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useAppSafeAreas();

    const backgroundColor = colors.background.get();
    const backgroundStyle = { backgroundColor };

    const renderHandleBar = useCallback(
      (props: BottomSheetHandleProps) => {
        // This adds an extra gap of unwanted space
        if (renderBehindTopInset && hideHandlebar) {
          return null;
        }
        return (
          <HandleBar
            {...props}
            hidden={hideHandlebar}
            containerFlexStyles={{ paddingBottom: 12, paddingTop: 16 }}
          />
        );
      },
      [backgroundColor, hideHandlebar, renderBehindTopInset]
    );

    const handleBarHeight = hideHandlebar ? 0 : 12 + 16 + 4;
    let fullContentHeight = dimensions.height - insets.top - handleBarHeight;

    const bottomSheetViewStyles: StyleProp<ViewStyle> = [
      { backgroundColor: backgroundColor },
    ];

    if (renderBehindTopInset) {
      bottomSheetViewStyles.push({ overflow: "hidden" });

      if (hideHandlebar) {
        bottomSheetViewStyles.push({
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        });
      }

      fullContentHeight += insets.top;
    } else if (hideHandlebar) {
      bottomSheetViewStyles.push({
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      });
    }

    if (fullScreen) {
      bottomSheetViewStyles.push({ height: fullContentHeight });
    }

    return (
      <BottomSheet
        ref={ref}
        onClose={onClose}
        backdropComponent={Backdrop}
        containerHeight={fullScreen ? dimensions.height : undefined}
        backgroundStyle={backgroundStyle}
        handleComponent={renderHandleBar}
        topInset={renderBehindTopInset ? 0 : insets.top}
        enablePanDownToClose
        enableHandlePanningGesture
        enableContentPanningGesture
        snapPoints={["100%"]}
      >
        <BottomSheetView style={bottomSheetViewStyles}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
AppBottomSheetModal.displayName = "AppBottomSheetModal";

const BACKDROP_APPEARS_ON_INDEX = 0;
const DISAPPEARS_ON_INDEX = -1;

const Backdrop = (props: BottomSheetBackdropProps): JSX.Element => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={BACKDROP_APPEARS_ON_INDEX}
      disappearsOnIndex={DISAPPEARS_ON_INDEX}
      opacity={0.4}
    />
  );
};

export const HandleBar = ({
  hidden = false,
  backgroundColor,
  containerFlexStyles,
}: {
  hidden?: boolean;
  backgroundColor?: ColorTokens | string;
  containerFlexStyles?: FlexStyle;
}) => {
  const colors = useTheme();
  const bg = hidden
    ? "transparent"
    : backgroundColor ?? colors.background.get();

  return (
    <Flex mt={IS_ANDROID ? 4 : "$0"}>
      <Flex
        alignItems="center"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        justifyContent="center"
        style={{
          ...containerFlexStyles,
          backgroundColor: bg,
        }}
      >
        <Flex
          alignSelf="center"
          backgroundColor={hidden ? "$transparent" : colors.gray10.get()}
          borderRadius={24}
          height={4}
          overflow="hidden"
          width={36}
        />
      </Flex>
    </Flex>
  );
};
