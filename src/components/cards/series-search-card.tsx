import FastImage from "react-native-fast-image";
import { BlurView } from "@react-native-community/blur";
import { router } from "expo-router";
import { Image, Text, YStack, ZStack } from "tamagui";

import { LibraryItem, Series } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";

import { SearchCard } from "./search-card";

const SeriesSearchCard = ({
  series,
  books,
  serverConfig,
  token,
  isCoverSquareAspectRatio,
}: {
  series: Series;
  books: LibraryItem[];
  serverConfig: ServerConfig;
  token?: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const seriesCardWidth = 80;
  const seriesCardHeight = 60;

  const totalBooks = books.length;

  const bgImg = getItemCoverSrc(books[0], serverConfig, serverConfig?.token);

  const handlePress = () => {
    router.push(`/library/series/${series.id}`);
  };
  return (
    <SearchCard onPress={handlePress}>
      {bgImg ? (
        <Image
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          resizeMode="cover"
          source={{
            uri: bgImg || "",
            width: seriesCardWidth,
            height: seriesCardHeight,
          }}
        />
      ) : null}
      <BlurView
        style={{
          height: seriesCardHeight,
          width: seriesCardWidth,
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
        blurType={"dark"}
        blurAmount={3}
        reducedTransparencyFallbackColor="black"
      />
      {/* book images */}
      <ZStack height={seriesCardHeight} width={seriesCardWidth}>
        {books.map((book, i) => {
          const src = getItemCoverSrc(book, serverConfig, token);

          let coverWidth = seriesCardWidth;
          let widthPer = seriesCardWidth;

          if (totalBooks > 1) {
            coverWidth = isCoverSquareAspectRatio ? 60 * 1.6 : 60 * 1;
            widthPer = (seriesCardWidth - coverWidth) / (totalBooks - 1);
          }

          const offsetLeft = widthPer * i;

          return (
            <YStack key={i} x={offsetLeft}>
              <FastImage
                key={i}
                style={{
                  height: seriesCardHeight,
                  width: coverWidth,
                }}
                resizeMode="contain"
                source={{
                  uri: src + `&format=webp`,
                }}
              />
            </YStack>
          );
        })}
      </ZStack>
      <YStack flex={1}>
        <Text>{series.name}</Text>
      </YStack>
    </SearchCard>
  );
};

export default SeriesSearchCard;
