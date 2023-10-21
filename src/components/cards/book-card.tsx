import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { BookX } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Card, Text, YStack, YStackProps } from "tamagui";

import { LibraryItemMinified } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { cleanString } from "../../utils/utils";

interface BookCardProps {
  item: LibraryItemMinified;
  token?: string;
  serverConfig: ServerConfig | null;
  isCoverSquareAspectRatio: boolean;
}

const BookCard = ({
  item,
  token,
  serverConfig,
  isCoverSquareAspectRatio,
  ...rest
}: BookCardProps & YStackProps) => {
  const [error, setError] = useState(false);
  const coverUrl = getItemCoverSrc(item, serverConfig, token);

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/book/${item.id}`);
  };

  useEffect(() => {
    setError(false);
  }, [isCoverSquareAspectRatio]);

  return (
    <YStack alignItems="center" {...rest}>
      <Card
        w={bookWidth + 3}
        height={bookHeight + 2.5}
        size="$4"
        elevate
        bordered
        pressStyle={{ scale: 0.875 }}
        animation="bouncy"
        onPress={handlePress}
        justifyContent="center"
        alignItems="center"
      >
        {!coverUrl || error ? (
          <BookX size={"$10"} />
        ) : (
          <FastImage
            resizeMode="cover"
            onError={() => setError(true)}
            id={item.media.metadata.title || ""}
            style={{
              borderRadius: 8,
              width: bookWidth,
              height: bookHeight,
              alignSelf: "center",
              justifyContent: "center",
            }}
            source={{
              uri: coverUrl + `&format=webp`,
            }}
          />
        )}
      </Card>
      <YStack maxWidth={bookWidth}>
        <Text numberOfLines={1} fontWeight={"$10"} pt={"$2"}>
          {item.media?.metadata?.title}
        </Text>
        <Text numberOfLines={1} fontSize={"$1"} color={"$gray10"}>
          {cleanString(
            "authorName" in item.media.metadata
              ? item.media.metadata.authorName
              : item.media.metadata.author,
            30
          )}
        </Text>
      </YStack>
    </YStack>
  );
};

export default BookCard;
