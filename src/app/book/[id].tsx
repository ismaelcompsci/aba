import React from "react";
import { Animated, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewMoreText from "react-native-view-more-text";
import { BlurView } from "@react-native-community/blur";
import { BookX, ChevronLeft } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Button,
  H3,
  H6,
  Image,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

import { ClearIconButton } from "../../components/buttons/button";
import OpenItemActionButton from "../../components/buttons/open-item-action-button";
import { FullScreen, ScreenCenter } from "../../components/center";
import { ParallaxScrollView } from "../../components/custom-components/parallax-scroll-view";
import GenresLabelScroll from "../../components/genres-label-scroll";
import ItemProgress from "../../components/item-progress";
import BookMoreMenu from "../../components/menus/book-more-menu";
import BookFilesTable from "../../components/tables/book-files-table";
import ChapterFilesTable from "../../components/tables/chapter-files-table";
import TrackFilesTable from "../../components/tables/track-files-table";
import { HEADER_HEIGHT } from "../../hooks/use-header-height";
import useIconTheme from "../../hooks/use-icon-theme";
import {
  currentItemAtom,
  isCoverSquareAspectRatioAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { appThemeAtom } from "../../state/local-state";
import { LibraryItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { encode, getGradient } from "../../utils/utils";

const DEFAULT_TRUNCATE = 5;

const BookPage = () => {
  // @ts-ignore
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const appScheme = useAtomValue(appThemeAtom);
  const { width, height } = useWindowDimensions();

  const userToken = useAtomValue(userTokenAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const setCurrentItem = useSetAtom(currentItemAtom);

  const insets = useSafeAreaInsets();
  const { bg: backgroundColor, color, bgPress } = useIconTheme();
  const IHeight = 400;

  const { data: bookItem, isLoading } = useQuery({
    queryKey: ["bookItem", `${Array.isArray(id) ? id[0] : id}`],
    queryFn: async () => {
      const response = await axios.get(`${serverAddress}/api/items/${id}`, {
        params: {
          expanded: 1,
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setCurrentItem(response.data);
      return response.data as LibraryItemExpanded;
    },
  });

  const cover = getItemCoverSrc(bookItem, null, userToken, serverAddress);
  const renderParallaxHeader = () => {
    const imageWidth = isCoverSquareAspectRatio ? width * 0.75 : undefined;

    return (
      <FullScreen w="100%" h="100%">
        {cover ? (
          <Image
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            resizeMode="cover"
            source={{
              uri: cover || "",
            }}
          />
        ) : null}
        <BlurView
          style={{
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          blurType={appScheme.scheme}
          blurAmount={3}
          reducedTransparencyFallbackColor="black"
        />
        {!cover || cover === "" ? (
          <YStack jc="center" h="100%" w="100%" alignItems="center">
            <BookX size="$19" />
          </YStack>
        ) : (
          <Animated.Image
            resizeMode="contain"
            style={{
              position: "absolute",
              zIndex: 50,
              top: -10,
              bottom: 0,
              left: isCoverSquareAspectRatio ? width / 2 - imageWidth! / 2 : 0,
              right: 0,
            }}
            source={{
              uri: cover || "",
              width: imageWidth,
            }}
          />
        )}
      </FullScreen>
    );
  };
  const renderFixedHeader = (value: Animated.Value) => {
    const opacity = value.interpolate({
      inputRange: [0, 150, 200],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });

    return (
      <View height={HEADER_HEIGHT} width="100%">
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor,
            },
            { opacity },
          ]}
        />
        <XStack height={HEADER_HEIGHT} width="100%" pt={44}>
          <ClearIconButton
            display="flex"
            flexDirection="row"
            onPress={() => router.back()}
          >
            <ChevronLeft />
            <Text>Go Back</Text>
          </ClearIconButton>
        </XStack>
      </View>
    );
  };

  const getSeries = () => {
    if (bookItem && "series" in bookItem.media.metadata) {
      return bookItem.media.metadata.seriesName;
    }

    return null;
  };

  const getAuthor = () => {
    if (bookItem && "author" in bookItem.media.metadata)
      return bookItem?.media.metadata.author;

    // @ts-ignore
    return bookItem?.media.metadata.authorName;
  };

  const getGenres = () => {
    if (bookItem && "genres" in bookItem.media.metadata) {
      return bookItem.media.metadata.genres;
    }

    return null;
  };

  const numChapters = () => {
    if (!bookItem) return 0;

    if ("chapters" in bookItem.media) {
      if (!bookItem.media.chapters) return 0;
      return bookItem.media.chapters.length || 0;
    }
    return 0;
  };

  const handleAuthorPress = () => {
    const authorId =
      bookItem && "authors" in bookItem.media.metadata
        ? bookItem.media.metadata.authors[0].id
        : null;

    if (authorId) router.push(`/library/authors/${encode(authorId)}`);
  };

  const handleSeriesPress = () => {
    return null;
  };

  const numberChapters = numChapters();
  const tracks =
    bookItem && "tracks" in bookItem.media ? bookItem?.media.tracks : null;
  const numTracks = tracks?.length;

  const genres = getGenres();
  const author = getAuthor();
  const series = getSeries();

  const renderViewMore = (onPress: () => void) => (
    <Text color={"$blue10"} onPress={onPress}>
      View more
    </Text>
  );
  const renderViewLess = (onPress: () => void) => (
    <Text color={"$blue10"} onPress={onPress}>
      View less
    </Text>
  );

  return (
    <FullScreen>
      {isLoading ? (
        <ScreenCenter paddingBottom={0}>
          <Spinner />
        </ScreenCenter>
      ) : null}
      {!bookItem ? (
        <ScreenCenter space="$3">
          <BookX size="$10" />
          <H3 color="$red10">No item found</H3>

          <Button onPress={() => router.back()}>Go back</Button>
        </ScreenCenter>
      ) : null}

      {!isLoading && bookItem ? (
        <ParallaxScrollView
          style={{ flex: 1 }}
          parallaxHeaderHeight={IHeight}
          parallaxHeader={renderParallaxHeader}
          fixedHeader={renderFixedHeader}
          showsVerticalScrollIndicator={false}
        >
          <FullScreen paddingBottom={insets.bottom}>
            <LinearGradient
              colors={getGradient(backgroundColor)}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{
                position: "absolute",
                height: 100,
                width: width,
                marginTop: -100,
              }}
            />
            <View minHeight={height - IHeight}>
              <View px={10} space="$1">
                <H3 numberOfLines={3} mt={-20}>
                  {bookItem.media.metadata.title}
                </H3>
                {series ? <H6 onPress={handleSeriesPress}>{series}</H6> : null}
                {author ? (
                  <Text
                    numberOfLines={2}
                    bg="$background"
                    color="$gray10"
                    textDecorationLine="underline"
                    onPress={handleAuthorPress}
                  >
                    {author}
                  </Text>
                ) : null}
                <XStack
                  bg="$background"
                  py="$2"
                  gap="$1"
                  justifyContent="space-between"
                >
                  <OpenItemActionButton bookItem={bookItem} id={id} />
                  <XStack
                    flex={1}
                    justifyContent="flex-end"
                    gap="$4"
                    alignItems="center"
                  >
                    <ItemProgress
                      id={id}
                      radius={22}
                      activeStrokeWidth={5}
                      inActiveStrokeWidth={6}
                      progressValueFontSize={14}
                      inActiveStrokeOpacity={0.4}
                      circleBackgroundColor={bgPress}
                      activeStrokeColor={color}
                    />
                    <BookMoreMenu
                      title={bookItem.media.metadata.title}
                      itemId={bookItem.id}
                    />
                  </XStack>
                </XStack>
                <ViewMoreText
                  renderViewLess={renderViewLess}
                  renderViewMore={renderViewMore}
                  numberOfLines={DEFAULT_TRUNCATE}
                >
                  <Text>{bookItem.media.metadata.description}</Text>
                </ViewMoreText>
                {genres?.length ? (
                  <GenresLabelScroll
                    genres={genres}
                    horizontal
                    space="$2"
                    pt="$2"
                    showsHorizontalScrollIndicator={false}
                  />
                ) : null}
                <BookFilesTable />
                {numberChapters ? (
                  <ChapterFilesTable libraryItem={bookItem} />
                ) : null}
                {numTracks ? <TrackFilesTable tracks={tracks} /> : null}
              </View>
            </View>
          </FullScreen>
        </ParallaxScrollView>
      ) : null}
    </FullScreen>
  );
};

export default BookPage;
