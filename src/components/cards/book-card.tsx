import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
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
} from "react-native-reanimated";
import { BookX } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Text } from "tamagui";

import { LibraryItemMinified } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import ItemProgress from "../item-progress";
import { AnimatedFlex, Flex } from "../layout/flex";
import { TouchableArea, TouchableAreaProps } from "../touchable/touchable-area";

import { pulseAnimation } from "./genre-card";

interface BookCardProps {
  item: LibraryItemMinified;
  token?: string;
  serverAddress: string;
  isCoverSquareAspectRatio: boolean;
}

const BookCard = ({
  item,
  token,
  serverAddress,
  isCoverSquareAspectRatio,
  ...rest
}: BookCardProps & TouchableAreaProps) => {
  const [error, setError] = useState(false);
  const coverUrl = getItemCoverSrc(item, null, token, serverAddress);

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  const handlePress = () => {
    router.push(`/book/${item.id}`);
  };

  const onGestureEvent =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
      onStart: () => {
        cancelAnimation(scale);
        scale.value = pulseAnimation(0.96);
      },
      onEnd: () => {
        runOnJS(handlePress)();
      },
    });

  useEffect(() => {
    setError(false);
  }, [isCoverSquareAspectRatio]);

  return (
    <TouchableArea
      hapticFeedback
      width={bookWidth + 3}
      animation="bouncy"
      alignItems="center"
      justifyContent="center"
      onPress={handlePress}
      flex={1}
      {...rest}
    >
      <TapGestureHandler onGestureEvent={onGestureEvent}>
        <AnimatedFlex style={animatedStyle}>
          <Flex pos={"absolute"} zIndex={"$5"} t={-5} r={-5}>
            <ItemProgress
              id={item.id}
              radius={10}
              activeStrokeWidth={3}
              inActiveStrokeWidth={3}
              withText={false}
              showOnlyBase={false}
              checkMarkSize={18}
            />
          </Flex>
          {!coverUrl || error ? (
            <BookX size="$10" />
          ) : (
            <FastImage
              resizeMode="cover"
              onError={() => setError(true)}
              id={item.media.metadata.title || ""}
              style={{
                borderRadius: 8,
                width: bookWidth,
                height: bookHeight,
                alignSelf: "center",
                justifyContent: "center",
              }}
              source={{
                uri: coverUrl + `&format=webp`,
              }}
            />
          )}
          <Flex w={bookWidth}>
            <Text numberOfLines={1} fontWeight="$10" pt="$2">
              {item.media?.metadata?.title}
            </Text>
            <Text fontSize="$1" color="$gray10" numberOfLines={1}>
              {"authorName" in item.media.metadata
                ? item.media.metadata.authorName
                : item.media.metadata.author}
            </Text>
          </Flex>
        </AnimatedFlex>
      </TapGestureHandler>
    </TouchableArea>
  );
};

export default BookCard;
