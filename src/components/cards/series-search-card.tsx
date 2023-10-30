import FastImage from "react-native-fast-image";
import { XStack, YStack, ZStack } from "tamagui";

import { LibraryItem, Series } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";

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

  //   const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  //   const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const totalBooks = books.length;

  return (
    <ZStack
      maxWidth={seriesCardWidth}
      maxHeight={seriesCardHeight}
      width={100}
      flex={1}
    >
      {books.map((book, i) => {
        const src = getItemCoverSrc(book, serverConfig, token);

        let coverWidth = seriesCardWidth;
        let widthPer = seriesCardWidth;

        if (totalBooks > 1) {
          // coverWidth = isCoverSquareAspectRatio
          //   ? bookHeight * 1.6
          //   : bookHeight * 1;
          widthPer = (seriesCardWidth - coverWidth) / (totalBooks - 1);
        }

        const offsetLeft = widthPer * i;

        return (
          <YStack key={i} x={offsetLeft}>
            <FastImage
              key={i}
              style={{
                //   height: bookHeight,
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
  );
};

export default SeriesSearchCard;
