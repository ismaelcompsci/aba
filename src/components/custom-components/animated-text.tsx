/**
 * https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
 * https://github.com/Uniswap/wallet/blob/main/apps/mobile/src/components/text/AnimatedText.tsx#L76
 */

import React from "react";
import type { TextInputProps, TextProps as RNTextProps } from "react-native";
import { StyleSheet, TextInput } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Text, TextProps as TamaTextProps, usePropsAndStyle } from "tamagui";

type TextPropsBase = TamaTextProps & Omit<TextInputProps, "value" | "style">;

type TextProps = TextPropsBase & {
  text?: Animated.SharedValue<string>;
  style?: Animated.AnimateProps<RNTextProps>["style"];
};

const styles = StyleSheet.create({
  baseStyle: {
    color: "black",
  },
});
Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const BaseAnimatedText = (props: TextProps) => {
  const { style, text, ...rest } = props;
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text?.value,
      // Here we use any because the text prop is not available in the type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={text?.value}
      style={[styles.baseStyle, style || undefined]}
      {...rest}
      {...{ animatedProps }}
    />
  );
};

const AnimatedText = ({ style, ...propsIn }: TextProps): JSX.Element => {
  const [props, textStyles] = usePropsAndStyle(
    {
      ...propsIn,
    },
    {
      forComponent: Text,
    }
  );

  return (
    <BaseAnimatedText
      {...(props as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
      style={[{ padding: 0 }, textStyles, style]}
    />
  );
};

export default AnimatedText;
