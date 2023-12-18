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
import { router } from "expo-router";
import { Text } from "tamagui";

import { LibraryItemMinified } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { BookCover } from "../covers/book-cover";
import ItemProgress from "../item-progress";
import { AnimatedFlex, Flex, FlexProps } from "../layout/flex";
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
  const coverUrl = getItemCoverSrc(item, null, token, serverAddress);

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;
  const isPodcast = item.mediaType === "podcast";

  const { recentEpisode, media } = item;
  const numEpisodesIncomplete =
    ("numEpisodesIncomplete" in item && item.numEpisodesIncomplete) || 0;

  const numEpisodes =
    "episodes" in media && media.episodes && isPodcast
      ? // @ts-ignore
        media.episodes.length
      : // @ts-ignore
        media.numEpisodes;

  const recentEpisodeNumber = recentEpisode
    ? recentEpisode.episode ?? ""
    : null;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  const handlePress = () => {
    if (recentEpisode) {
      router.push(`/book/${item.id}/${recentEpisode.id}`);
    } else {
      router.push(`/book/${item.id}`);
    }
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

  // useEffect(() => {
  //   setError(false);
  // }, [isCoverSquareAspectRatio]);

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
          {!isPodcast || recentEpisode ? (
            <Flex pos={"absolute"} zIndex={"$5"} t={-5} r={-5}>
              <ItemProgress
                episodeId={recentEpisode?.id}
                id={item.id}
                radius={10}
                activeStrokeWidth={3}
                inActiveStrokeWidth={3}
                withText={false}
                showOnlyBase={false}
                checkMarkSize={18}
              />
            </Flex>
          ) : null}
          <BookCover
            bookHeight={bookHeight}
            bookWidth={bookWidth}
            coverUrl={coverUrl}
            fastImageProps={{
              resizeMode: "cover",
            }}
          />
          <Flex w={bookWidth}>
            <Text numberOfLines={1} fontWeight="$10" pt="$2">
              {item.recentEpisode
                ? item.recentEpisode.title
                : item.media?.metadata?.title}
            </Text>
            <Text fontSize="$1" color="$gray10" numberOfLines={1}>
              {"authorName" in item.media.metadata
                ? item.media.metadata.authorName
                : item.media.metadata.author}
            </Text>
          </Flex>
          {recentEpisodeNumber ? (
            <HoverLabel label={`Episode #${recentEpisodeNumber}`} />
          ) : null}
          {numEpisodesIncomplete ? (
            <HoverLabel label={`${numEpisodesIncomplete}`} />
          ) : null}
          {numEpisodes && !numEpisodesIncomplete ? (
            <HoverLabel label={`${numEpisodesIncomplete}`} />
          ) : null}
        </AnimatedFlex>
      </TapGestureHandler>
    </TouchableArea>
  );
};

const HoverLabel = ({
  label,
  ...rest
}: FlexProps & {
  label: string;
}) => {
  return (
    <Flex
      borderRadius={8}
      pos={"absolute"}
      top={5}
      left={3}
      bg={"$backgroundStrong"}
      padding={2}
      shadowColor="$shadowColor"
      shadowOffset={{
        width: -6,
        height: 11,
      }}
      shadowOpacity={1}
      shadowRadius={7}
      alignItems="center"
      px={4.5}
      {...rest}
    >
      <Text textAlign="center" fontSize={11}>
        {label}
      </Text>
    </Flex>
  );
};

export default BookCard;
