/**
 * https://github.com/Uniswap/wallet/blob/main/packages/ui/src/components/layout/Flex.tsx
 */

import { Stack, StackProps, styled } from "tamagui";

import { withAnimated } from "../touchable/with-animated";

export type FlexProps = StackProps & {
  row?: boolean;
  shrink?: boolean;
  grow?: boolean;
  fill?: boolean;
  centered?: boolean;
};

export const Flex = styled(Stack, {
  flexDirection: "column",
  variants: {
    row: {
      true: {
        flexDirection: "row",
      },
    },

    shrink: {
      true: {
        flexShrink: 1,
      },
    },

    grow: {
      true: {
        flexGrow: 1,
      },
    },

    fill: {
      true: {
        flex: 1,
      },
    },

    centered: {
      true: {
        alignItems: "center",
        justifyContent: "center",
      },
    },
  } as const,
});

export const AnimatedFlex = withAnimated(Flex);
