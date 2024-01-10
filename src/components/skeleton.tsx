import { useEffect } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AnimatedFlex, FlexProps } from "./layout/flex";

export const Skeleton = ({
  children,
  ...rest
}: { children?: React.ReactNode } & FlexProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.1, { duration: 1000 }), -1, true);
  }, []);

  return (
    <AnimatedFlex style={{ opacity }} {...rest}>
      {children}
    </AnimatedFlex>
  );
};
