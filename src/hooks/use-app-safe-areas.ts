import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HEADER_HEIGHT = 98;
export const HEADER_HEIGHT_TAB_BAR = 98;

export const useAppSafeAreas = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (HEADER_HEIGHT - insets.top);
  const headerAndTabBarHeight = headerHeight + 65;

  return { headerHeight, headerAndTabBarHeight, ...insets };
};
