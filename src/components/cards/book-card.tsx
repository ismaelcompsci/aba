import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { BookX } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Card, Text, XStack, YStack, YStackProps } from "tamagui";

import useIconTheme from "../../hooks/use-icon-theme";
import { LibraryItemMinified } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { cleanString } from "../../utils/utils";
import { AuthorText } from "../author-text";
import ItemProgress from "../item-progress";

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

  const { color, bgPress } = useIconTheme();

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/book/${item.id}`);
  };

  useEffect(() => {
    setError(false);
  }, [isCoverSquareAspectRatio]);

  return (
    <YStack alignItems="center" bg="$background" {...rest} pt="$2">
      <Card
        w={bookWidth + 3}
        height={bookHeight + 2.5}
        size="$4"
        elevation={"$0.75"}
        bordered
        pressStyle={{ scale: 0.875 }}
        animation="bouncy"
        onPress={handlePress}
        justifyContent="center"
        alignItems="center"
      >
        <XStack pos={"absolute"} zIndex={"$5"} t={-8} r={-6}>
          <ItemProgress
            id={item.id}
            radius={12}
            activeStrokeWidth={2}
            inActiveStrokeWidth={3}
            progressValueFontSize={8}
            circleBackgroundColor={bgPress}
            activeStrokeColor={color}
          />
        </XStack>
        {!coverUrl || error ? (
          <BookX size="$10" />
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
        <Text numberOfLines={1} fontWeight="$10" pt="$2">
          {item.media?.metadata?.title}
        </Text>
        <AuthorText>
          {cleanString(
            "authorName" in item.media.metadata
              ? item.media.metadata.authorName
              : item.media.metadata.author,
            30
          )}
        </AuthorText>
      </YStack>
    </YStack>
  );
};

export default BookCard;
