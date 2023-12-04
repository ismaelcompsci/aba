import { forwardRef, useRef, useState } from "react";
import {
  GestureResponderEvent,
  NativeSyntheticEvent,
  TextInput,
  TextInputEndEditingEventData,
} from "react-native";
import Popover from "react-native-popover-view";
import { Mode, Placement, Point } from "react-native-popover-view/dist/Types";
import { Pen, Trash } from "@tamagui/lucide-icons";
import {
  Button,
  GetRef,
  Separator,
  TamaguiElement,
  Text,
  useTheme,
} from "tamagui";

import { Flex, FlexProps } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { TouchableArea } from "../../components/touchable/touchable-area";

const TestPage = () => {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <Screen edges={["top"]} centered px="$4">
      <Flex fill centered space width={"100%"}>
        <InputWithTags tags={tags} setTags={setTags} />
        <Button>End</Button>
      </Flex>
    </Screen>
  );
};

const SELECTED_TAG_DEFAULT = {
  index: -1,
  tag: "",
  x: -1,
  y: -1,
};

type InputWithTagsProps = {
  defaultTags?: string[];
  tags: string[];
  setTags: (tags: string[]) => void;
} & FlexProps;

export const InputWithTags = ({
  tags,
  setTags,
  ...rest
}: InputWithTagsProps) => {
  const textInputRef = useRef<TextInput>(null);
  const inputWrapperRef = useRef<TamaguiElement>(null);
  const [selectedTag, setSelectedTag] = useState(SELECTED_TAG_DEFAULT);
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
    setSelectedTag({
      index,
      tag,
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    });
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
      {...rest}
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
      {selectedTag ? (
        <Popover
          from={new Point(selectedTag.x, selectedTag.y)}
          mode={Mode.RN_MODAL}
          placement={Placement.TOP}
          isVisible={showPopover}
          onRequestClose={() => {
            setSelectedTag(SELECTED_TAG_DEFAULT);
            setShowPopover(false);
          }}
          backgroundStyle={{
            backgroundColor: "black",
            opacity: 0.1,
          }}
          popoverStyle={{
            backgroundColor: colors.background.get(),
          }}
        >
          <Flex px="$4" py="$2" row space>
            <TouchableArea>
              <Pen size={14} />
            </TouchableArea>
            <Separator vertical />
            <TouchableArea>
              <Trash size={14} color={colors.red11.get()} />
            </TouchableArea>
          </Flex>
        </Popover>
      ) : null}
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
