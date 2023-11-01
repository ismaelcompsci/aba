import FastImage from "react-native-fast-image";
import { BlurView } from "@react-native-community/blur";
import { router } from "expo-router";
import { Card, Image, Text, XStack, YStack, ZStack } from "tamagui";

import { SeriesBooksMinified } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { encode } from "../../utils/utils";

interface SeriesCardProps {
  item: SeriesBooksMinified;
  isCoverSquareAspectRatio: boolean;
  serverConfig: ServerConfig | null;
}

const SeriesCard = ({
  item,
  isCoverSquareAspectRatio,
  serverConfig,
}: SeriesCardProps) => {
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;
  const totalBooks = item.books.length;

  const seriesCardWidth = bookWidth * 2;

  const bgImg = getItemCoverSrc(
    item.books[0],
    serverConfig,
    serverConfig?.token
  );

  const handlePress = () => {
    router.push(`/library/series/${encode(item.id)}`);
  };

  return (
    <Card
      w={bookWidth * 2}
      overflow="hidden"
      justifyContent="center"
      h={bookHeight + 22}
      borderColor={"$backgroundFocus"}
      borderWidth={1}
      mt="$4"
      br={"$4"}
      elevate
      elevation={"$0.75"}
      pressStyle={{ scale: 0.875 }}
      animation="bouncy"
      onPress={handlePress}
    >
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
          }}
        />
      ) : null}
      <BlurView
        style={{
          height: bookHeight,
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
      <ZStack maxWidth={50} maxHeight={bookHeight} width={100} flex={1}>
        {item.books.map((book, i) => {
          const src = getItemCoverSrc(book, serverConfig, serverConfig?.token);

          let coverWidth = seriesCardWidth;
          let widthPer = seriesCardWidth;

          if (totalBooks > 1) {
            coverWidth = isCoverSquareAspectRatio
              ? bookHeight * 1.6
              : bookHeight * 1;
            widthPer = (seriesCardWidth - coverWidth) / (totalBooks - 1);
          }

          const offsetLeft = widthPer * i;

          return (
            <YStack key={i} x={offsetLeft}>
              <FastImage
                key={i}
                style={{
                  height: bookHeight,
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

      {/* name */}
      <XStack
        w={"100%"}
        justifyContent="center"
        borderColor={"$color"}
        borderWidth={"$0.25"}
        borderBottomStartRadius={"$2"}
        borderBottomEndRadius={"$2"}
        bg="$background"
      >
        <Text numberOfLines={1} fontSize={"$5"} textAlign="center">
          {item.name}
        </Text>
      </XStack>
    </Card>
  );
};

export default SeriesCard;
