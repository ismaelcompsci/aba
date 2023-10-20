import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HEADER_HEIGHT = 98;
export const HEADER_HEIGHT_TAB_BAR = 98 + 44;

export const useHeaderHeight = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (HEADER_HEIGHT - insets.top);
  const headerAndTabBarHeight = headerHeight + 44;

  return { headerHeight, top: insets.top, headerAndTabBarHeight };
};
