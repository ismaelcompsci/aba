import { Text, XStack, YStack } from "tamagui";
import { ebookFormat, humanFileSize } from "../../utils/helpers";
import { LibraryItem } from "../../types/server";

interface ItemInfoProps {
  item: LibraryItem | null | undefined;
}

const ItemInfo = ({ item }: ItemInfoProps) => {
  if (!item) return null;

  return (
    <XStack px={"$3"} justifyContent="space-between">
      {!!item?.media.ebookFile && !!item.media.ebookFile.metadata.ext && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Format
          </Text>
          <Text>{ebookFormat(item?.media.ebookFile)?.toUpperCase()}</Text>
        </YStack>
      )}
      {!!item?.media.ebookFile.metadata.size && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Size
          </Text>
          <Text>
            {humanFileSize(item?.media.ebookFile.metadata.size || 0, true)}
          </Text>
        </YStack>
      )}
      {!!item?.media.metadata.language && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Language
          </Text>
          <Text>{item?.media.metadata.language}</Text>
        </YStack>
      )}
    </XStack>
  );
};

export default ItemInfo;
