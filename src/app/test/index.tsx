import { forwardRef, useRef, useState } from "react";
import {
  GestureResponderEvent,
  NativeSyntheticEvent,
  TextInput,
  TextInputEndEditingEventData,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Popover from "react-native-popover-view";
import {
  Mode,
  Placement,
  Point,
  Rect,
} from "react-native-popover-view/dist/Types";

import { Button, GetRef, TamaguiElement, Text, useTheme } from "tamagui";

import { Flex, FlexProps } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { Trash } from "@tamagui/lucide-icons";
import { TouchableArea } from "../../components/touchable/touchable-area";

const TestPage = () => {
  return (
    <Screen edges={["top"]} centered px="$4">
      <Flex fill centered space width={"100%"}>
        <InputWithTags />
        <Button>End</Button>
      </Flex>
    </Screen>
  );
};

export const InputWithTags = ({ defaultTags }: { defaultTags?: string[] }) => {
  const textInputRef = useRef<TextInput>(null);
  const inputWrapperRef = useRef<TamaguiElement>(null);
  const [tags, setTags] = useState<string[]>(defaultTags || []);
  const [selectedTag, setSelectedTag] = useState({ index: -1, tag: "" });
  const tagRefs = useRef<GetRef<typeof Flex>[]>([]);
  const [showPopover, setShowPopover] = useState(false);

  const colors = useTheme();

  const onEndEditing = (
    e: NativeSyntheticEvent<TextInputEndEditingEventData>
  ) => {
    if (!e.nativeEvent.text) return;
    setTags([...tags, e.nativeEvent.text.trim()]);
    textInputRef.current?.clear();
  };

  const tagPress = (e: GestureResponderEvent, tag: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTag({ index, tag });
    setShowPopover(true);
  };

  return (
    <Flex
      ref={inputWrapperRef}
      width="100%"
      minHeight={36}
      borderRadius="$4"
      borderWidth={2}
      borderColor={"$borderColor"}
      py="$2"
      px="$2"
      row
      alignItems="center"
      flexWrap="wrap"
      onPress={() => textInputRef.current?.focus()}
      gap="$1.5"
    >
      {tags.map((tag, i) => {
        const selected = tag === selectedTag.tag;
        return (
          <InputTag
            ref={(ref) => {
              if (ref) tagRefs.current[i] = ref;
              return ref;
            }}
            key={tag + String(i)}
            tag={tag}
            selected={selected}
            onPress={(e) => tagPress(e, tag, i)}
          />
          //   <Flex
          //     ref={(el) => (tagRefs.current[i] = el)}
          //     onPress={(e) => tagPress(e, tag, i)}
          //     key={tag + String(i)}
          //     borderRadius={"$4"}
          //     px="$2"
          //     py="$1"
          //     bg={selected ? "$color" : "$backgroundPress"}
          //     pos={"relative"}
          //     alignItems="center"
          //     pressStyle={{
          //       opacity: 0.8,
          //     }}
          //   >
          //     <Text color={selected ? "$background" : "$color"} fontSize={12}>
          //       {tag}
          //     </Text>
          //   </Flex>
        );
      })}
      <TextInput
        ref={textInputRef}
        multiline
        returnKeyLabel="Add"
        onEndEditing={onEndEditing}
        blurOnSubmit
        style={{
          color: colors.color.get(),
          paddingBottom: 5,
          paddingLeft: 4,
        }}
      />
      <Popover
        from={tagRefs.current[selectedTag.index]}
        mode={Mode.RN_MODAL}
        placement={Placement.TOP}
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
        backgroundStyle={{
          backgroundColor: "black",
          opacity: 0.2,
        }}
        popoverStyle={{
          backgroundColor: colors.background.get(),
        }}
      >
        <Flex px="$4" py="$2">
          <TouchableArea>
            <Trash size="$1" color={colors.red11.get()} />
          </TouchableArea>
        </Flex>
      </Popover>
    </Flex>
  );
};

type InputTagProps = FlexProps & {
  selected: boolean;
  tag: string;
};

const InputTag = forwardRef<TamaguiElement, InputTagProps>(
  ({ selected, tag, ...rest }, ref) => {
    return (
      <Flex
        ref={ref}
        borderRadius={"$4"}
        px="$2"
        py="$1"
        bg={selected ? "$color" : "$backgroundPress"}
        pos={"relative"}
        alignItems="center"
        pressStyle={{
          opacity: 0.8,
        }}
        {...rest}
      >
        <Text color={selected ? "$background" : "$color"} fontSize={12}>
          {tag}
        </Text>
      </Flex>
    );
  }
);

InputTag.displayName = "InputTag";

export default TestPage;
