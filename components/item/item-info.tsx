import { Text, XStack, YStack } from "tamagui";
import { ebookFormat, humanFileSize } from "../../utils/helpers";
import { LibraryItem } from "../../types/adbs";

interface ItemInfoProps {
  item: LibraryItem | null | undefined;
}

const ItemInfo = ({ item }: ItemInfoProps) => {
  if (!item) return null;

  const isPodcast = item.mediaType === "podcast";

  const ebookFile =
    "ebookFile" in item.media ? item.media.ebookFile : undefined;
  const ext =
    "ebookFile" in item.media ? item.media.ebookFile?.metadata.ext : undefined;
  const size =
    "ebookFile" in item.media ? item.media.ebookFile?.metadata.size : undefined;

  return (
    <XStack px={"$3"} justifyContent="space-between">
      {!!ebookFile && !!ext && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Format
          </Text>
          <Text>{ebookFormat(ebookFile)?.toUpperCase()}</Text>
        </YStack>
      )}
      {!!size && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Size
          </Text>
          <Text>{humanFileSize(size || 0, true)}</Text>
        </YStack>
      )}
      {!!item.media.metadata.language && (
        <YStack space={"$space.2"}>
          <Text fontSize={"$2"} color={"$gray9"}>
            Language
          </Text>
          <Text>{item.media.metadata.language}</Text>
        </YStack>
      )}
    </XStack>
  );
};

export default ItemInfo;
