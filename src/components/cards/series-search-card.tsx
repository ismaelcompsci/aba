import FastImage from "react-native-fast-image";
import { Image, Text, XStack, YStack, ZStack } from "tamagui";

import { LibraryItem, Series } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { BlurView } from "@react-native-community/blur";

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

  return (
    <XStack w="100%" pressStyle={{ opacity: 0.8 }} gap="$2">
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
          position: "absolute",
          width: seriesCardWidth,
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
    </XStack>
  );
};

export default SeriesSearchCard;
