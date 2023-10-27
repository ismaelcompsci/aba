import React from "react";
import { Animated, Dimensions } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReadMore from "@fawazahmed/react-native-read-more";
import { BlurView } from "@react-native-community/blur";
import {
  BookOpen,
  BookX,
  ChevronLeft,
  MoreHorizontal,
  Play,
} from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Button,
  H3,
  H6,
  Image,
  ScrollView,
  Spinner,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

import { ActionButton } from "../../components/book-info";
import { ClearIconButton } from "../../components/buttons/button";
import { ScreenCenter } from "../../components/center";
import { ParallaxScrollView } from "../../components/custom-components/parallax-scroll-view";
import BookFilesTable from "../../components/tables/book-files-table";
import ChapterFilesTable from "../../components/tables/chapter-files-table";
import TrackFilesTable from "../../components/tables/track-files-table";
import { HEADER_HEIGHT } from "../../hooks/use-header-height";
import { currentItemAtom, userAtom } from "../../state/app-state";
import { appThemeAtom, currentServerConfigAtom } from "../../state/local-state";
import { LibraryItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { getGradient } from "../../utils/utils";

const layout = Dimensions.get("window");

const DEFAULT_TRUNCATE = 5;

const BookPage = () => {
  // @ts-ignore
  const { id, percent } = useLocalSearchParams<{
    id: string;
    percent?: number;
  }>();
  const appScheme = useAtomValue(appThemeAtom);

  const user = useAtomValue(userAtom);
  const config = useAtomValue(currentServerConfigAtom);
  const setCurrentItem = useSetAtom(currentItemAtom);

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const backgroundColor = theme.background.get();
  const color = theme.color.get();
  const seeTextColor = theme.blue10.get();
  const IHeight = 400;

  const { data: bookItem, isLoading } = useQuery({
    queryKey: ["bookItem", `${Array.isArray(id) ? id[0] : id}`],
    queryFn: async () => {
      const response = await axios.get(
        `${config.serverAddress}/api/items/${id}`,
        {
          params: {
            expanded: 1,
            include: "rssfeed",
          },
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setCurrentItem(response.data);
      return response.data as LibraryItemExpanded;
    },
    refetchOnMount: true,
    staleTime: 0,
  });

  const cover = getItemCoverSrc(bookItem, config, user?.token);

  const renderParallaxHeader = () => {
    return (
      <View w="100%" h="100%">
        <>
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
        </>
        {!cover || cover === "" ? (
          <YStack jc="center" h="100%" w="100%" alignItems="center">
            <BookX size="$19" />
          </YStack>
        ) : (
          <Animated.Image
            resizeMode="contain"
            style={{
              position: "absolute",
              top: -10,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 50,
            }}
            source={{
              uri: cover || "",
            }}
          />
        )}
      </View>
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

  if (isLoading) {
    return (
      <ScreenCenter>
        <Spinner />
      </ScreenCenter>
    );
  } else if (!bookItem) {
    return (
      <ScreenCenter space="$3">
        <BookX size="$10" />
        <H3 color="$red10">No item found</H3>

        <Button onPress={() => router.back()}>Go back</Button>
      </ScreenCenter>
    );
  }

  const canShowPlay = () => {
    if (!bookItem || isMissing || isInvalid) return false;
    if ("tracks" in bookItem.media && bookItem.media.tracks) {
      return !!bookItem.media.tracks.length;
    }
    if ("episodes" in bookItem.media && bookItem.media.episodes) {
      return !!bookItem.media.episodes.length;
    }
    return false;
  };

  const canShowRead = () => {
    if (!bookItem || isMissing || isInvalid) return false;

    if ("ebookFile" in bookItem.media && bookItem.media.ebookFile) {
      return true;
    }

    return false;
  };

  const showPlay = canShowPlay();
  const showRead = canShowRead();

  const getActionButton = () => {
    if (showPlay) {
      return (
        <ActionButton
          onPress={() => console.log("TODO: OPEN PLAYER")}
          bg={"$green10"}
        >
          <Play size="$1" />
          <Text>Play</Text>
        </ActionButton>
      );
    } else if (showRead) {
      return (
        <ActionButton
          bg={"$blue10"}
          onPress={() => router.push(`/reader/${bookItem.id}`)}
        >
          <BookOpen size="$1" />
          <Text>Read {ebookFormat?.toUpperCase()}</Text>
        </ActionButton>
      );
    } else {
      return (
        <Button
          chromeless
          onPress={() => console.log("ITEM IS MISSING")}
          bg={"$red10Dark"}
          theme={"blue"}
          flex={1}
        >
          <Text>Missing</Text>
        </Button>
      );
    }
  };

  const getSeries = () => {
    if ("series" in bookItem.media.metadata) {
      return bookItem.media.metadata.seriesName;
    }

    return null;
  };

  const getAuthor = () => {
    if ("author" in bookItem.media.metadata)
      return bookItem?.media.metadata.author;

    return bookItem?.media.metadata.authorName;
  };

  const getGenres = () => {
    if ("genres" in bookItem.media.metadata) {
      return bookItem.media.metadata.genres;
    }

    return null;
  };

  const numChapters = () => {
    if ("chapters" in bookItem.media) {
      if (!bookItem.media.chapters) return 0;
      return bookItem.media.chapters.length || 0;
    }
    return 0;
  };

  const libraryFiles = bookItem.libraryFiles || [];
  const numberChapters = numChapters();
  const ebookFiles = libraryFiles.filter((lf) => lf.fileType === "ebook");
  const ebookFile =
    "ebookFile" in bookItem.media ? bookItem.media.ebookFile : null;
  const ebookFormat = ebookFile?.ebookFormat;
  const tracks = "tracks" in bookItem.media ? bookItem.media.tracks : null;
  const numTracks = tracks?.length;
  const isMissing = bookItem?.isMissing;
  const isInvalid = bookItem?.isInvalid;
  // const subtitle =
  //   bookItem && "subtitle" in bookItem.media.metadata
  //     ? bookItem.media.metadata.subtitle
  //     : null;

  const genres = getGenres();
  const author = getAuthor();
  const series = getSeries();

  return (
    <View flex={1} bg="$background">
      <ParallaxScrollView
        style={{ flex: 1 }}
        parallaxHeaderHeight={IHeight}
        parallaxHeader={renderParallaxHeader}
        fixedHeader={renderFixedHeader}
        showsVerticalScrollIndicator={false}
      >
        <View w="100%" bg="$background" paddingBottom={insets.bottom}>
          <LinearGradient
            colors={getGradient(backgroundColor)}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: "absolute",
              height: 100,
              width: layout.width,
              marginTop: -100,
            }}
          />
          <View minHeight={layout.height - IHeight}>
            <View px={10} space="$1">
              <H3 numberOfLines={3} mt={-20}>
                {bookItem.media.metadata.title}
              </H3>
              <H6>{series}</H6>
              <Text numberOfLines={2} bg="$background" color="$gray10">
                {author}
              </Text>
              <XStack
                bg="$background"
                py="$2"
                gap="$1"
                justifyContent="space-between"
              >
                {getActionButton()}
                <XStack
                  flex={1}
                  justifyContent="flex-end"
                  gap="$4"
                  alignItems="center"
                >
                  {percent && percent > 0 ? (
                    <CircularProgress
                      value={percent * 100}
                      radius={22}
                      activeStrokeWidth={5}
                      inActiveStrokeWidth={6}
                      progressValueFontSize={14}
                      inActiveStrokeOpacity={0.4}
                    />
                  ) : null}
                  <Button>
                    <MoreHorizontal />
                  </Button>
                </XStack>
              </XStack>
              <ReadMore
                numberOfLines={DEFAULT_TRUNCATE}
                seeMoreText="More"
                seeLessText="Less"
                seeLessStyle={{ color: seeTextColor }}
                seeMoreStyle={{ color: seeTextColor }}
                style={{
                  color,
                  alignSelf: "flex-start",
                  textAlign: "justify",
                }}
              >
                {bookItem.media.metadata.description}
              </ReadMore>
              {genres ? (
                <ScrollView
                  horizontal
                  space="$2"
                  pt="$2"
                  showsHorizontalScrollIndicator={false}
                >
                  {genres.map((gen) => (
                    <Button
                      h="$2"
                      br="$10"
                      noTextWrap
                      key={gen}
                      bordered
                      transparent
                    >
                      <Text>{gen}</Text>
                    </Button>
                  ))}
                </ScrollView>
              ) : null}
              {ebookFiles.length ? (
                <BookFilesTable ebookFiles={ebookFiles} itemId={bookItem.id} />
              ) : null}
              {numberChapters ? (
                <ChapterFilesTable libraryItem={bookItem} />
              ) : null}
              {numTracks ? <TrackFilesTable tracks={tracks} /> : null}
            </View>
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  );
};

export default BookPage;
