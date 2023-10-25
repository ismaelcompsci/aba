import React from "react";
import { Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReadMore from "@fawazahmed/react-native-read-more";
import { BlurView } from "@react-native-community/blur";
import { ChevronLeft, MoreHorizontal } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Button, H3, Image, Text, useTheme, View, XStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

import { ClearIconButton } from "../../components/buttons/button";
import { ParallaxScrollView } from "../../components/custom-components/parallax-scroll-view";
import { HEADER_HEIGHT } from "../../hooks/use-header-height";

const uri =
  "http://192.168.1.159:54932/api/items/b5a64be0-31d8-4272-b72e-4554f535d2ef/cover?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs";

const layout = Dimensions.get("window");

const TestPage = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const bg = theme.background.get();
  const color = theme.color.get();
  const seeTextColor = theme.blue10.get();
  const IHeight = 400;

  const renderParallaxHeader = (value: Animated.Value) => {
    const inputRange = [0, 600];
    const translateY = value.interpolate({
      inputRange,
      outputRange: [0, -IHeight],
    });

    return (
      <View w={"100%"} h={"100%"}>
        <>
          <Image
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            resizeMode={"cover"}
            source={{
              uri: uri,
            }}
          />
          <BlurView
            style={{
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            blurType="light"
            blurAmount={3}
            reducedTransparencyFallbackColor="white"
          />
        </>
        <Animated.Image
          resizeMode={"contain"}
          style={{
            position: "absolute",
            top: -10,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 50,
            // transform: [{ translateY }],
          }}
          source={{
            uri: uri,
          }}
        />
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
      <View
        style={{
          height: HEADER_HEIGHT,
          width: "100%",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: bg,
            },
            { opacity },
          ]}
        />
        <XStack
          style={{
            height: HEADER_HEIGHT,
            width: layout.width,
            paddingTop: 44,
          }}
        >
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

  return (
    <View style={{ flex: 1 }} bg={"$background"}>
      <ParallaxScrollView
        style={{ flex: 1 }}
        parallaxHeaderHeight={IHeight}
        parallaxHeader={renderParallaxHeader}
        fixedHeader={renderFixedHeader}
        showsVerticalScrollIndicator={false}
        // scaleParallaxHeader={false}
      >
        <View
          style={{
            width: "100%",
          }}
          bg={"$background"}
          paddingBottom={insets.bottom}
        >
          <LinearGradient
            colors={["$background", "rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: "absolute",
              height: 75,
              width: layout.width,
              marginTop: -75,
            }}
          />
          <View>
            <View px={10}>
              <H3 numberOfLines={3}>{book.media.metadata.title}</H3>
              <Text bg={"$background"} color={"$gray10"}>
                {book.media.metadata.authorName}
              </Text>
              <XStack
                bg={"$background"}
                py={"$2"}
                gap={"$1"}
                justifyContent="space-between"
              >
                <Button flex={1}>Read now</Button>
                <XStack flex={1} justifyContent="flex-end">
                  <Button>
                    <MoreHorizontal />
                  </Button>
                </XStack>
              </XStack>
              {/* <Text bg={"$background"}>{book.media.metadata.description}</Text> */}
              <ReadMore
                numberOfLines={5}
                seeMoreText="More"
                seeLessText="Less"
                seeLessStyle={{ color: seeTextColor }}
                seeMoreStyle={{ color: seeTextColor }}
                style={{
                  color,
                }}
              >
                {book.media.metadata.description}
              </ReadMore>
              <ReadMore />
            </View>
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  );
};

export default TestPage;

const book = {
  id: "b5a64be0-31d8-4272-b72e-4554f535d2ef",
  ino: "3702619",
  oldLibraryItemId: null,
  libraryId: "c3553286-9660-495d-997b-cdb7d77f11c8",
  folderId: "6639cc3a-372d-4af1-969e-5e86ce575dbc",
  path: "/ebooks/Peter F. Hamilton/Commonweatlh Universe/A Window Into Time (2838)",
  relPath: "Peter F. Hamilton/Commonweatlh Universe/A Window Into Time (2838)",
  isFile: false,
  mtimeMs: 1674565772524,
  ctimeMs: 1674565775160,
  birthtimeMs: 0,
  addedAt: 1674565783502,
  updatedAt: 1674566158424,
  lastScan: null,
  scanVersion: null,
  isMissing: false,
  isInvalid: false,
  mediaType: "book",
  media: {
    id: "68675a50-f27e-40d5-af5a-aef9be29b981",
    libraryItemId: "b5a64be0-31d8-4272-b72e-4554f535d2ef",
    metadata: {
      title: "A Window Into Time (2838)",
      titleIgnorePrefix: "A Window Into Time (2838)",
      subtitle: null,
      authors: [
        {
          id: "c7ad33a6-ed14-45a9-9d35-d4004e8edd46",
          name: "Peter F. Hamilton",
        },
      ],
      narrators: [],
      series: [
        {
          id: "eb783781-d187-436b-96cb-8a4bad8bf560",
          name: "Commonweatlh Universe",
          sequence: "",
        },
      ],
      genres: ["Fiction"],
      publishedYear: null,
      publishedDate: null,
      publisher: "Del Rey",
      description:
        "A profound, poignant, mind-blowing trip into time and consciousness awaits in this ebook original novella from New York Times bestselling author Peter F. Hamilton. In the vein of Life After Life, Hamilton’s bold speculations into the nature of life—and what comes after—make for riveting, provocative fiction. The universe is not only stranger than we imagine, it is stranger than we can imagine. Whip-smart thirteen-year-old Julian Costello Proctor—better known as Jules—has an eidetic memory. For as long as he can remember, he has remembered everything. “My mind is always on,” he explains. But when an unexpected death throws his life into turmoil, Jules begins to experience something strange. For the first time, there are holes in his memory. But that’s not the strangest part. What’s really weird isn’t what he’s forgotten; it’s what he remembers. Memories of another life, not his own. And not from some distant past. No, these memories belong to a man who’s alive right now. With bravery, ingenuity, and quirky good humor, Jules devises a theory to explain this baffling phenomenon. While tracking down the identity of his mysterious doppelgänger, he finds himself enmeshed in the hopes and dreams of a stranger . . . and caught in the coils of a madman’s deadly plot. Praise for Peter F. Hamilton “The owner of the most powerful imagination in science fiction, author of immense, complex far-future sagas.”—Ken Follett “The clear heir to Heinlein, in my view.”—Marc Andreessen, co-founder, Netscape “Space Opera doesn’t get much more epic than Peter F. Hamilton.”—SFFWorld “Hamilton tackles SF the way George R. R. Martin is tackling fantasy.”—SF Reviews “Fusing elements of hard SF with adventure fantasy tropes, Hamilton has singlehandedly raised the bar for grand-scale speculative storytelling.”—Publishers Weekly “The author’s mastery of the art of the ‘big story’ earns him a place among the leading authors of dynastic SF.”—Library Journal",
      isbn: "9780425286494",
      asin: null,
      language: null,
      explicit: false,
      authorName: "Peter F. Hamilton",
      authorNameLF: "Hamilton, Peter F.",
      narratorName: "",
      seriesName: "Commonweatlh Universe",
      abridged: false,
    },
    coverPath: "/metadata/items/li_2l1h9d570wuuwtkdi4/cover.jpg",
    tags: [],
    audioFiles: [],
    chapters: [],
    duration: 0,
    size: 979446,
    tracks: [],
    missingParts: [],
    ebookFile: {
      ino: "3702620",
      metadata: {
        filename: "A Window Into Time - Peter F. Hamilton.epub",
        ext: ".epub",
        path: "/ebooks/Peter F. Hamilton/Commonweatlh Universe/A Window Into Time (2838)/A Window Into Time - Peter F. Hamilton.epub",
        relPath: "A Window Into Time - Peter F. Hamilton.epub",
        size: 979446,
        mtimeMs: 1674565772528,
        ctimeMs: 1674565775129,
        birthtimeMs: 0,
      },
      ebookFormat: "epub",
      addedAt: 1674565783502,
      updatedAt: 1674565783502,
    },
  },
  libraryFiles: [
    {
      ino: "3702620",
      metadata: {
        filename: "A Window Into Time - Peter F. Hamilton.epub",
        ext: ".epub",
        path: "/ebooks/Peter F. Hamilton/Commonweatlh Universe/A Window Into Time (2838)/A Window Into Time - Peter F. Hamilton.epub",
        relPath: "A Window Into Time - Peter F. Hamilton.epub",
        size: 979446,
        mtimeMs: 1674565772528,
        ctimeMs: 1674565775129,
        birthtimeMs: 0,
      },
      isSupplementary: false,
      addedAt: 1674565783502,
      updatedAt: 1674565783502,
      fileType: "ebook",
    },
  ],
  size: 979446,
  rssFeed: null,
};
