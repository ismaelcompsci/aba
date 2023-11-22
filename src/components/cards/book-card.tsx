import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { BookX } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Text } from "tamagui";

import { LibraryItemMinified } from "../../types/aba";
import { ServerConfig } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import ItemProgress from "../item-progress";
import { Flex, FlexProps } from "../layout/flex";

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
}: BookCardProps & FlexProps) => {
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
    <Flex {...rest}>
      <Flex
        width={bookWidth + 3}
        height={bookHeight + 2.5}
        pressStyle={{ scale: 0.9 }}
        animation="bouncy"
        onPress={handlePress}
        centered
      >
        <Flex pos={"absolute"} zIndex={"$5"} t={-5} r={-5}>
          <ItemProgress
            id={item.id}
            radius={10}
            activeStrokeWidth={3}
            inActiveStrokeWidth={3}
            withText={false}
            showOnlyBase={false}
            checkMarkSize={18}
          />
        </Flex>
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
      </Flex>
      <Flex w={bookWidth}>
        <Text numberOfLines={1} fontWeight="$10" pt="$2">
          {item.media?.metadata?.title}
        </Text>
        <Text fontSize="$1" color="$gray10" numberOfLines={1}>
          {"authorName" in item.media.metadata
            ? item.media.metadata.authorName
            : item.media.metadata.author}
        </Text>
      </Flex>
    </Flex>
  );
};

export default BookCard;
