import FastImage from "react-native-fast-image";
import { router } from "expo-router";
import { Text } from "tamagui";

import { LibraryItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { cleanString } from "../../utils/utils";
import { Flex } from "../layout/flex";

import { SearchCard } from "./search-card";

const ItemSearchCard = ({
  item,
  serverAddress,
  token,
  isCoverSquareAspectRatio,
}: {
  item: LibraryItemExpanded;
  serverAddress: string;
  token?: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const src = getItemCoverSrc(item, null, token, serverAddress);

  const bookWidth = isCoverSquareAspectRatio ? 50 * 1.2 : 50;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/book/${item.id}`);
  };

  return (
    <SearchCard onPress={handlePress} height={bookHeight}>
      <FastImage
        style={{
          width: bookWidth,
          height: bookHeight,
        }}
        resizeMode="contain"
        source={{
          uri: src + `&format=webp`,
        }}
      />
      <Flex fill>
        <Text>{item.media.metadata.title}</Text>
        <Text fontSize={"$1"} color={"$gray10"} numberOfLines={1}>
          by{" "}
          {cleanString(
            "authorName" in item.media.metadata
              ? item.media.metadata.authorName
              : item.media.metadata.author,
            30
          )}
        </Text>
      </Flex>
    </SearchCard>
  );
};

export default ItemSearchCard;
