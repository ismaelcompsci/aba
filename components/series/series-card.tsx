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

  const booksCardWidth = bookWidth * item.books.length;

  const l = seriesCardWidth / 2 + 12;

  return (
    <YStack
      borderColor={"$blue10Dark"}
      borderWidth={0.2}
      w={seriesCardWidth}
      px={"$2"}
      py={"$2"}
    >
      {/* book images */}
      <XStack w={"100%"}>
        {item.books.map((book, i) => {
          const src = getItemCoverSrc(
            book,
            currentServerConfig,
            currentServerConfig.token
          );

          const coverFileType = book.media.coverPath?.split(".").pop();

          return (
            <XStack>
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
