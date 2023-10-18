import React, { memo } from "react";
import { Path, Svg } from "react-native-svg";
import type { IconProps } from "@tamagui/helpers-icon";
import { themed } from "@tamagui/helpers-icon";

// @ts-ignore
const Icon = (props: any) => {
  const { color = "black", size = 24, ...otherProps } = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 50 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...otherProps}
    >
      <Path
        d="M25 0l25 15.01v9.976L25 40 0 24.986V15.01L25 0z"
        fill="#A5B4FC"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 15.01L25 0l25 15.01v9.976L25 40 0 24.986V15.01zM25 33.63l19.697-11.829v-3.607h-.001L25 30.02 5.304 18.195v3.607L25 33.631zm0-9.126l15.102-9.067-3.68-2.208L25 20.088 13.577 13.23l-3.679 2.208L25 24.505zm0-9.932l6.829-4.1L25 6.375l-6.829 4.098 6.829 4.1z"
        fill="#4F46E5"
      />
      <Path d="M25 0L0 15.01v9.976L25 40V0z" fill="#A5B4FC" fillOpacity={0.3} />
    </Svg>
  );
};

Icon.displayName = "Logo";

export const Logo = memo<IconProps>(themed(Icon));
