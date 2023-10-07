import { Card, CardFooter, Image, Stack, Text } from "tamagui";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../../constants/data-uris";
import { ServerConfig } from "../login/login-form";
import { useRouter } from "expo-router";
import { LibraryItemMinified } from "../../types/adbs";
import { useEffect, useState } from "react";
import { BlurView } from "@react-native-community/blur";
import { ImageLoadEventData, NativeSyntheticEvent } from "react-native";
import ItemImage from "../item-image";

interface BookCardProps {
  item: LibraryItemMinified;
  token: string;
  currentServerConfig: ServerConfig;
  isCoverSquareAspectRatio: boolean;
}

const BookCard = ({
  item,
  token,
  currentServerConfig,
  isCoverSquareAspectRatio,
}: BookCardProps) => {
  const router = useRouter();
  const cover = getItemCoverSrc(item, currentServerConfig, token);

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeigth = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <Stack
      onPress={handlePress}
      mb={"$2"}
      pressStyle={{ scale: 0.98 }}
      justifyContent="center"
      key={item.id}
      w={bookWidth} // change this to make compact book covers
      bg={"$background"}
    >
      <ItemImage
        bookHeight={bookHeigth}
        bookWidth={bookWidth}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        cover={cover}
        title={item.media.metadata.title || ""}
      />

      <CardFooter gap={"$1"} p={0} display="flex" flexDirection="column">
        <Text pl={"$1"} pt={"$1.5"} numberOfLines={1}>
          {item.media?.metadata?.title}
        </Text>
        <Text pl={"$1"} numberOfLines={1} fontSize={"$1"} color={"$gray10"}>
          {cleanString(
            "authorName" in item.media.metadata
              ? item.media.metadata.authorName
              : item.media.metadata.author,
            30
          )}
        </Text>
      </CardFooter>
    </Stack>
  );
};

export default BookCard;

/* 
// <Stack
        //   overflow="hidden"
        //   h={bookHeigth}
        //   w={bookWidth}
        //   p={0}
        //   m={0}
        //   borderRadius={"$4"}
        // >
        //   {isCoverSquareAspectRatio && (
        //     <>
        //       <Image
        //         position="absolute"
        //         top={0}
        //         left={0}
        //         bottom={0}
        //         right={0}
        //         onLoad={handleImageOnLoad}
        //         flex={1}
        //         resizeMode={"cover"}
        //         source={{
        //           uri: cover,
        //         }}
        //       />
        //       <BlurView
        //         style={{
        //           height: "100%",
        //           position: "absolute",
        //           top: 0,
        //           left: 0,
        //           bottom: 0,
        //           right: 0,
        //         }}
        //         blurType="light"
        //         blurAmount={3}
        //         reducedTransparencyFallbackColor="white"
        //       />
        //     </>
        //   )}
        //   <Image
        //     position="absolute"
        //     top={0}
        //     left={0}
        //     bottom={0}
        //     right={0}
        //     onLoad={handleImageOnLoad}
        //     zIndex={"$3"}
        //     flex={1}
        //     resizeMode={resizeMode()}
        //     source={{
        //       uri: cover,
        //     }}
        //   />
        // </Stack>
*/
