import FastImage from "react-native-fast-image";
import { router } from "expo-router";
import { Image, Text, ZStack } from "tamagui";

import { LibraryItem, Series } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { encode } from "../../utils/utils";
import { Flex } from "../layout/flex";

import { SearchCard } from "./search-card";

const SeriesSearchCard = ({
  series,
  books,
  serverAddress,
  token,
  isCoverSquareAspectRatio,
}: {
  series: Series;
  books: LibraryItem[];
  serverAddress: string;
  token?: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const seriesCardWidth = 80;
  const seriesCardHeight = 60;

  const totalBooks = books.length;

  const bgImg = getItemCoverSrc(books[0], null, token, serverAddress);

  const handlePress = () => {
    router.push(`/library/series/${encode(series.id)}`);
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
          blurRadius={10}
        />
      ) : null}
      {/* book images */}
      <ZStack height={seriesCardHeight} width={seriesCardWidth}>
        {books.map((book, i) => {
          const src = getItemCoverSrc(book, null, token, serverAddress);

          let coverWidth = seriesCardWidth;
          let widthPer = seriesCardWidth;

          if (totalBooks > 1) {
            coverWidth = isCoverSquareAspectRatio ? 60 * 1.6 : 60 * 1;
            widthPer = (seriesCardWidth - coverWidth) / (totalBooks - 1);
          }

          const offsetLeft = widthPer * i;

          return (
            <Flex key={i} x={offsetLeft}>
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
            </Flex>
          );
        })}
      </ZStack>
      <Flex fill>
        <Text>{series.name}</Text>
      </Flex>
    </SearchCard>
  );
};

export default SeriesSearchCard;
