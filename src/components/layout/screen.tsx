import { useMemo } from "react";
import { NativeSafeAreaViewProps } from "react-native-safe-area-context";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";

import { Flex, FlexProps } from "./flex";

type ScreenProps = FlexProps &
  Omit<NativeSafeAreaViewProps, "mode"> & { noInsets?: boolean } & {
    header?: boolean;
    headerAndTabBar?: boolean;
  };

function ScreenSafeAreas({
  children,
  header,
  headerAndTabBar,
  edges,
  ...rest
}: ScreenProps) {
  /**
   * used for centering items on the screen
   */
  const safeAreas = useAppSafeAreas();

  const safeAreasStyles = useMemo(() => {
    const styles: { [key: string]: number } = {};
    const headerStyles: { [key: string]: number } = {};
    if (header) {
      headerStyles.paddingBottom = safeAreas.headerHeight;
    }
    if (headerAndTabBar) {
      headerStyles.paddingBottom = safeAreas.headerAndTabBarHeight;
    }

    if (Array.isArray(edges) && edges?.includes("top")) {
      styles.paddingTop = safeAreas.top;
    }

    if (Array.isArray(edges) && edges?.includes("bottom")) {
      styles.paddingBottom = safeAreas.bottom;
    }

    if (Array.isArray(edges) && edges?.includes("left")) {
      styles.paddingLeft = safeAreas.left;
    }
    if (Array.isArray(edges) && edges?.includes("right")) {
      styles.paddingRight = safeAreas.right;
    }

    return { styles, headerStyles };
  }, [edges, safeAreas]);

  return (
    <Flex
      style={[safeAreasStyles.styles, safeAreasStyles.headerStyles]}
      {...rest}
    >
      {children}
    </Flex>
  );
}

export function Screen({ children, bg = "$background", ...rest }: ScreenProps) {
  return (
    <ScreenSafeAreas fill bg={bg} {...rest}>
      {children}
    </ScreenSafeAreas>
  );
}
