import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useHeaderHeight = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (94 - insets.top);

  return { headerHeight, top: insets.top };
};
