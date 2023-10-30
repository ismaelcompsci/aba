import { MoreVertical } from "@tamagui/lucide-icons";
import { Adapt, Button, Popover, PopoverProps, XStack } from "tamagui";

import { ClearIconButton } from "../buttons/button";

// tamagui popover
export function BookFilePopover({
  onButtonPress,
  ...props
}: PopoverProps & {
  onButtonPress: () => void;
}) {
  return (
    <Popover size="$5" allowFlip {...props}>
      <Popover.Trigger asChild>
        <ClearIconButton>
          <MoreVertical />
        </ClearIconButton>
      </Popover.Trigger>

      <Adapt when={"xxs"} platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <XStack>
          <Button onPress={onButtonPress}>Set as primary</Button>
        </XStack>
      </Popover.Content>
    </Popover>
  );
}
