import { Text, XStack, YStack } from "tamagui";
import { SeriesBooksMinified } from "../../types/adbs";
import { Image } from "react-native";
import { useAtomValue } from "jotai/react";
import { currentServerConfigAtom } from "../../utils/local-atoms";
import { getItemCoverSrc } from "../../utils/helpers";
import ItemImage from "../item-image";

interface SeriesCardProps {
  item: SeriesBooksMinified;
  isCoverSquareAspectRatio: boolean;
  screenWidth: number;
}

const SeriesCard = ({
  item,
  isCoverSquareAspectRatio,
  screenWidth,
}: SeriesCardProps) => {
  const currentServerConfig = useAtomValue(currentServerConfigAtom);

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeigth = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const seriesCardWidth = bookWidth * 2 - 25;

  return (
    <YStack
      w={"100%"}
      px={"$2"}
      py={"$2"}
      overflow="hidden"
      justifyContent="center"
    >
      {/* book images */}
      <XStack w={"100%"} justifyContent="center">
        {item.books.map((book, i) => {
          const src = getItemCoverSrc(
            book,
            currentServerConfig,
            currentServerConfig.token
          );

          const coverFileType = book.media.coverPath?.split(".").pop();

          return (
            <XStack key={i}>
              <ItemImage
                cover={src}
                coverFileType={coverFileType}
                isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                itemId={book.id}
                title={book.media.metadata.title || ""}
                bookHeight={bookHeigth}
                bookWidth={bookWidth}
              />
            </XStack>
          );
        })}
      </XStack>

      {/* name */}
      <XStack
        w={"100%"}
        justifyContent="center"
        borderColor={"$blue10"}
        borderWidth={"$0.25"}
        borderRadius={"$4"}
      >
        <Text numberOfLines={1} fontSize={"$6"} textAlign="center">
          {item.name}
        </Text>
      </XStack>
    </YStack>
  );
};

export default SeriesCard;
