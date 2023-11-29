import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import {
  cancelAnimation,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { ArrowRight } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Card, Text, useTheme, XStack, YStack } from "tamagui";

import { encode } from "../../utils/utils";
import { AnimatedFlex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

const GenreCard = ({ genre }: { genre: string }) => {
  const colors = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  const handleGenreCardPress = () => {
    if (!genre) return;
    router.push(`/library/genres/${encode(genre)}`);
  };

  const onGestureEvent =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
      onStart: () => {
        cancelAnimation(scale);
        scale.value = pulseAnimation(0.96);
      },
      onEnd: () => {
        runOnJS(handleGenreCardPress)();
      },
    });

  return (
    <TouchableArea hapticFeedback onPress={handleGenreCardPress}>
      <TapGestureHandler onGestureEvent={onGestureEvent}>
        <AnimatedFlex style={animatedStyle}>
          <Card
            w={124}
            h={"$8"}
            elevate
            elevation={"$0.75"}
            bg={"$backgroundPress"}
          >
            <YStack flex={1}>
              <YStack
                bg={colors.color.get()}
                r={0}
                borderBottomLeftRadius={"$10"}
                borderTopRightRadius={"$3"}
                pos="absolute"
                h={"$3"}
                w={"$4"}
              >
                <XStack jc="center" p="$1.5">
                  <ArrowRight color={colors.background.get()} size={"$1"} />
                </XStack>
              </YStack>
              <Text
                pos="absolute"
                b="$2"
                l="$2"
                fontWeight={"$10"}
                fontSize={"$4"}
                numberOfLines={2}
                w={110}
              >
                {genre}
              </Text>
            </YStack>
          </Card>
        </AnimatedFlex>
      </TapGestureHandler>
    </TouchableArea>
  );
};

export function pulseAnimation(
  activeScale: number,
  spingAnimationConfig: WithSpringConfig = { damping: 1, stiffness: 200 }
): number {
  "worklet";
  return withSequence(
    withSpring(activeScale, spingAnimationConfig),
    withSpring(1, spingAnimationConfig)
  );
}

export default GenreCard;
