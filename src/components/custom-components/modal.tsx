import {
  Modal as BaseModal,
  ModalProps as MProps,
  StyleSheet,
  View,
} from "react-native";
import { X } from "@tamagui/lucide-icons";
import { ColorTokens, SizeTokens, Text } from "tamagui";

import { Flex } from "../layout/flex";
import { TouchableArea, TouchableAreaProps } from "../touchable/touchable-area";

export type ModalProps = MProps & {
  dimBackground?: boolean;
  hide?: () => void;
  width?: number | "100%";
  title?: string;
  showCloseButton?: boolean;
};

export const Modal = ({
  presentationStyle = "overFullScreen",
  animationType = "none",
  transparent = true,
  showCloseButton,
  dimBackground,
  children,
  width,
  title,
  hide,
  ...rest
}: ModalProps) => {
  return (
    <BaseModal
      animationType={animationType}
      presentationStyle={presentationStyle}
      transparent={transparent}
      {...rest}
    >
      <TouchableArea
        alignItems="center"
        flexGrow={1}
        justifyContent="center"
        style={dimBackground && style.bgDimmed}
        onPress={hide}
      >
        <Flex
          backgroundColor="$background"
          style={width === "100%" ? style.modalBoxFullWidth : style.modalBox}
          width={width}
          onPress={() => {}}
        >
          {title && (
            <Text mb={12} px={16} fontSize={24}>
              {title}
            </Text>
          )}
          {hide && showCloseButton && (
            <View style={style.closeButtonContainer}>
              <CloseButton size={14} onPress={hide} />
            </View>
          )}
          {children}
        </Flex>
      </TouchableArea>
    </BaseModal>
  );
};

type CloseButtonProps = {
  onPress: () => void;
  color?: ColorTokens | null | undefined;
  size?: number | SizeTokens | undefined;
  strokeWidth?: number | SizeTokens | undefined;
} & TouchableAreaProps;

const CloseButton = ({
  size,
  color,
  strokeWidth,
  onPress,
  ...rest
}: CloseButtonProps) => {
  return (
    <TouchableArea onPress={onPress} {...rest}>
      <X color={color} size={size ?? 20} strokeWidth={strokeWidth ?? 2} />
    </TouchableArea>
  );
};

const modalBoxBaseStyle = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 15,
    elevation: 5,
    margin: 20,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

const style = StyleSheet.create({
  bgDimmed: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  closeButtonContainer: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 100_000,
  },
  modalBox: modalBoxBaseStyle.base,
  modalBoxFullWidth: {
    ...modalBoxBaseStyle.base,
    margin: 0,
    padding: 0,
  },
});
