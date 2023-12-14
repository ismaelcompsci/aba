import { useMemo } from "react";
import { Image } from "react-native";
import FastImage from "react-native-fast-image";
import { router } from "expo-router";
import { Text, ZStack } from "tamagui";

import { IS_ANDROID } from "../../constants/consts";
import { SeriesBooksMinified } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { encode } from "../../utils/utils";
import { Flex } from "../layout/flex";

interface SeriesCardProps {
  item: SeriesBooksMinified;
  isCoverSquareAspectRatio: boolean;
  serverAddress: string;
  userToken: string;
}

const SeriesCard = ({
  item,
  isCoverSquareAspectRatio,
  serverAddress,
  userToken,
}: SeriesCardProps) => {
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;
  const totalBooks = item.books.length;

  const seriesCardWidth = bookWidth * 2;

  const bgImg = getItemCoverSrc(item.books[0], null, userToken, serverAddress);

  const handlePress = () => {
    router.push(`/library/series/${encode(item.id)}?name=${item.name}`);
  };

  const bookPhotos = useMemo(() => {
    return (
      <ZStack height={bookHeight} width={100} flex={1}>
        {item.books.map((book, i) => {
          const src = getItemCoverSrc(book, null, userToken, serverAddress);

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
            <Flex key={i} x={offsetLeft}>
              <FastImage
                key={i}
                style={{
                  height: bookHeight,
                  width: coverWidth,
                }}
                resizeMode="contain"
                source={{
                  uri: src + `&format=webp`,
                  priority: IS_ANDROID ? "low" : "normal",
                }}
              />
            </Flex>
          );
        })}
      </ZStack>
    );
  }, []);

  return (
    <Flex
      w={bookWidth * 2}
      overflow="hidden"
      justifyContent="center"
      h={bookHeight + 22}
      borderColor={"$backgroundFocus"}
      borderWidth={1}
      mt="$4"
      br={"$4"}
      pressStyle={{ scale: 0.875 }}
      animation="bouncy"
      onPress={handlePress}
      bg={"$background"}
    >
      {bgImg ? (
        <Image
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          blurRadius={15}
          resizeMode="cover"
          source={{
            uri: bgImg || "",
          }}
        />
      ) : null}
      {/* book images */}
      {bookPhotos}

      {/* name */}
      <Flex
        row
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
      </Flex>
    </Flex>
  );
};

export default SeriesCard;
