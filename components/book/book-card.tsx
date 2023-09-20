import {
  Card,
  CardFooter,
  Image,
  Spinner,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import { PLACEHOLDER, PLACEHOLDER_IMAGE } from "../../constants/data-uris";
import { ServerConfig } from "../login/login-form";
import { LibraryItemMinified } from "../../types/server";
import { useRouter } from "expo-router";

interface BookCardProps {
  item: LibraryItemMinified;
  token: string;
  currentServerConfig: ServerConfig;
}

const BookCard = ({ item, token, currentServerConfig }: BookCardProps) => {
  const router = useRouter();
  const cover = getItemCoverSrc(item, token, currentServerConfig);

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <Card
      onPress={handlePress}
      mb={"$2"}
      pressStyle={{ scale: 0.98 }}
      justifyContent="center"
      key={item.id}
      w={150} // change this to make compact book covers
      px={"$2"}
    >
      {cover ? (
        <Stack
          aspectRatio={"1/1.5"}
          overflow="hidden"
          h={200}
          w={150}
          p={0}
          m={0}
          borderRadius={"$4"}
        >
          <Image
            flex={1}
            resizeMode="cover"
            source={{
              uri: cover,
            }}
          />
        </Stack>
      ) : (
        <Card
          h={200}
          w={142}
          bordered
          bg={"$backgroundHover"}
          justifyContent="center"
        >
          <Text zIndex={10} textAlign="center" color={"white"} fontSize={"$5"}>
            {cleanString(item.media.metadata.title, 60)}
          </Text>
          <Card.Background>
            <Image
              zIndex={-20}
              resizeMode="contain"
              alignSelf="center"
              source={{
                width: 200,
                height: 200,
                uri: PLACEHOLDER_IMAGE,
              }}
            />
          </Card.Background>
        </Card>
      )}
      <CardFooter p={0} display="flex" flexDirection="column">
        <Text numberOfLines={1}>{item.media?.metadata?.title}</Text>
        <Text numberOfLines={1} fontSize={"$1"} color={"$gray10"}>
          {cleanString(item.media.metadata.authorName, 30)}
        </Text>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
