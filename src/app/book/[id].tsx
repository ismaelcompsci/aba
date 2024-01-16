import React, { useEffect, useMemo } from "react";
import { Animated, useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import ViewMoreText from "react-native-view-more-text";
import { BookX } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, H3, H6, Image, Text, useTheme } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

import OpenItemActionButton from "../../components/buttons/open-item-action-button";
import { ParallaxScrollView } from "../../components/custom-components/parallax-scroll-view";
import GenresLabelScroll from "../../components/genres-label-scroll";
import ItemProgress from "../../components/item-progress";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { Loaders } from "../../components/loader";
import BookMoreMenu from "../../components/menus/book-more-menu";
import BookFilesTable from "../../components/tables/book-files-table";
import ChapterFilesTable from "../../components/tables/chapter-files-table";
import PodcastEpisodesTable from "../../components/tables/podcast-episodes-table";
import TrackFilesTable from "../../components/tables/track-files-table";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import {
  currentItemAtom,
  isCoverSquareAspectRatioAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { LibraryItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { encode, getGradient } from "../../utils/utils";

const DEFAULT_TRUNCATE = 5;

const BookPage = () => {
  // @ts-ignore
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const { width, height } = useWindowDimensions();
  const { top } = useAppSafeAreas();

  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const setCurrentItem = useSetAtom(currentItemAtom);
  const safeAreas = useAppSafeAreas();

  const colors = useTheme();

  const IHeight = 400;

  const { data: bookItem, isLoading } = useQuery({
    queryKey: ["bookItem", id],
    queryFn: async () => {
      const response = await axios.get(`${serverAddress}/api/items/${id}`, {
        params: {
          expanded: 1,
          include: "rssfeed",
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setCurrentItem(response.data);
      return response.data as LibraryItemExpanded;
    },
  });

  const renderFixedHeader = (value: Animated.Value) => {
    const opacity = value.interpolate({
      inputRange: [0, 150, 200],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });

    return (
      <Flex>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: colors.background.get(),
            },
            { opacity },
          ]}
        />
        <BackHeader
          color="$blue9"
          alignment="center"
          mx={16}
          pt={top + 16}
          pl={safeAreas.left}
          pb={16}
          showButtonLabel
        />
      </Flex>
    );
  };

  const renderParallaxHeader = () => {
    return <BookParallaxHeader bookItem={bookItem} />;
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
    const author =
      bookItem && "authors" in bookItem.media.metadata
        ? bookItem.media.metadata.authors[0]
        : null;

    if (author)
      router.push(`/library/authors/${encode(author.id)}?name=${author.name}`);
  };

  const handleSeriesPress = () => {
    return null;
  };

  const tracks =
    bookItem && "tracks" in bookItem.media ? bookItem?.media.tracks : null;
  const numTracks = tracks?.length;

  const isPodcast = bookItem?.mediaType === "podcast";
  const episodes =
    bookItem && "episodes" in bookItem.media ? bookItem?.media.episodes : null;

  const feedUrl =
    bookItem && "feedUrl" in bookItem.media.metadata
      ? bookItem?.media?.metadata?.feedUrl
      : null;

  const { author, genres, series, numberChapters, ebookFiles } = useMemo(
    () => ({
      genres: getGenres(),
      author: getAuthor(),
      series: getSeries(),
      numberChapters: numChapters(),
      ebookFiles: bookItem?.libraryFiles.filter(
        (lf) => lf.fileType === "ebook"
      ),
    }),
    [bookItem, bookItem?.libraryFiles]
  );

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

  useEffect(() => {
    return () => {
      setCurrentItem(null);
    };
  }, []);

  return (
    <Screen edges={isLoading ? ["top"] : undefined}>
      {isLoading ? (
        <Flex fill centered>
          <Loaders.Main />
        </Flex>
      ) : null}
      {!bookItem && !isLoading ? (
        <Flex fill centered space="$3">
          <BookX size="$10" />
          <H3 color="$red10">No item found</H3>

          <Button onPress={() => router.back()}>Go back</Button>
        </Flex>
      ) : null}

      {!isLoading && bookItem ? (
        <ParallaxScrollView
          style={{ flex: 1 }}
          parallaxHeaderHeight={IHeight}
          parallaxHeader={renderParallaxHeader}
          fixedHeader={renderFixedHeader}
          showsVerticalScrollIndicator={false}
        >
          <Flex bg="$background" pb={44}>
            <LinearGradient
              colors={getGradient(colors.background.get())}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{
                position: "absolute",
                height: 100,
                width: width,
                marginTop: -100,
              }}
            />
            <Flex minHeight={height - IHeight}>
              <Flex px={10} space="$1">
                <Text fontSize={"$9"} numberOfLines={3} mt={-20}>
                  {bookItem.media.metadata.title}
                </Text>
                {series ? <H6 onPress={handleSeriesPress}>{series}</H6> : null}
                {author ? (
                  <Text
                    numberOfLines={2}
                    bg="$background"
                    color="$gray10"
                    textDecorationLine={isPodcast ? "none" : "underline"}
                    onPress={handleAuthorPress}
                    accessible
                    accessibilityRole="link"
                  >
                    {author}
                  </Text>
                ) : null}
                <Flex row py="$2" gap="$1" justifyContent="space-between">
                  <OpenItemActionButton bookItem={bookItem} id={id} />
                  <Flex
                    row
                    fill
                    gap="$4"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    {!isPodcast ? (
                      <ItemProgress
                        id={id}
                        radius={22}
                        activeStrokeWidth={5}
                        inActiveStrokeWidth={6}
                        progressValueFontSize={14}
                        checkMarkSize={24}
                        inActiveStrokeOpacity={0.4}
                        circleBackgroundColor={colors.backgroundPress.get()}
                        activeStrokeColor={colors.color.get()}
                      />
                    ) : null}
                    {!isPodcast ? (
                      <BookMoreMenu
                        title={bookItem.media.metadata.title}
                        itemId={bookItem.id}
                        isPodcast={isPodcast}
                      />
                    ) : null}
                  </Flex>
                </Flex>
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
                {isPodcast && episodes ? (
                  <PodcastEpisodesTable
                    podcastId={bookItem.id}
                    episodes={episodes}
                    rssFeedUrl={feedUrl}
                    libraryItemId={id}
                  />
                ) : null}
                {ebookFiles?.length ? <BookFilesTable /> : null}
                {numberChapters ? (
                  <ChapterFilesTable libraryItem={bookItem} />
                ) : null}
                {numTracks ? <TrackFilesTable tracks={tracks} /> : null}
              </Flex>
            </Flex>
          </Flex>
        </ParallaxScrollView>
      ) : null}
    </Screen>
  );
};

const BookParallaxHeader = ({
  bookItem,
}: {
  bookItem?: LibraryItemExpanded;
}) => {
  const { width } = useWindowDimensions();
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  const imageWidth = isCoverSquareAspectRatio ? width * 0.75 : undefined;

  const cover = getItemCoverSrc(bookItem, null, userToken, serverAddress);

  return (
    <Flex fill>
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
          blurRadius={10}
        />
      ) : null}
      {!cover || cover === "" ? (
        <Flex centered fill>
          <BookX size="$19" />
        </Flex>
      ) : (
        <FastImage
          resizeMode="contain"
          style={{
            position: "absolute",
            zIndex: 50,
            top: -10,
            bottom: 0,
            left: isCoverSquareAspectRatio ? width / 2 - imageWidth! / 2 : 0,
            right: 0,
            width: imageWidth,
          }}
          source={{
            uri: cover || "",
          }}
        />
      )}
    </Flex>
  );
};

export default BookPage;
