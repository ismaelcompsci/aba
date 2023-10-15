import { CardFooter, Stack, Text, XStack } from "tamagui";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import { ServerConfig } from "../login/login-form";
import { useRouter } from "expo-router";
import { LibraryItemMinified } from "../../types/adbs";
import ItemImage from "../item-image";

interface BookCardProps {
  item: LibraryItemMinified;
  token: string;
  currentServerConfig: ServerConfig;
  isCoverSquareAspectRatio: boolean;
  isHomeView?: boolean;
}

const BookCard = ({
  item,
  token,
  currentServerConfig,
  isCoverSquareAspectRatio,
  isHomeView = false,
}: BookCardProps) => {
  const router = useRouter();
  const cover = getItemCoverSrc(item, currentServerConfig, token);
  const coverFileType = item.media.coverPath?.split(".").pop();

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeigth = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    // <XStack
    //   justifyContent="center"
    //   w={isHomeView ? null : "100%"}
    //   alignContent="center"
    //   alignItems="center"
    // >
    <Stack
      onPress={handlePress}
      pressStyle={{ scale: 0.98 }}
      justifyContent="center"
      key={item.id}
      w={bookWidth}
      bg={"$background"}
    >
      <ItemImage
        bookHeight={bookHeigth}
        bookWidth={bookWidth}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        cover={cover}
        title={item.media.metadata.title || ""}
        itemId={item.id}
        coverFileType={coverFileType}
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
  {
    /* </XStack> */
  }
};

export default BookCard;
