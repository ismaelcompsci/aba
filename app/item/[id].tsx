import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { getLibraryItem } from "../../api/library";
import { LibraryItem } from "../../types/server";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import { useAtomValue, useSetAtom } from "jotai/react";
import {
  currentServerConfigAtom,
  currentUserAtom,
} from "../../utils/local-atoms";
import { PLACEHOLDER_IMAGE } from "../../constants/data-uris";
import { currentItemAtom, showReaderAtom } from "../../utils/atoms";

const ItemHeaderPicture = () => {
  return (
    <XStack h={"$8"}>
      <Text>HEADER</Text>
    </XStack>
  );
};

const ItemPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const user = useAtomValue(currentUserAtom);
  const setCurrentItem = useSetAtom(currentItemAtom);
  const config = useAtomValue(currentServerConfigAtom);

  const [truncate, setTruncate] = useState(3);
  const [item, setItem] = useState<LibraryItem | null>();

  useEffect(() => {
    const fetchItem = async () => {
      const _id = Array.isArray(id) ? id[0] : id;
      const { error, data } = await getLibraryItem(_id);
      setCurrentItem(data);

      if (error) {
        console.log("[ITEM_ERROR]", error);
      }

      setItem(data);
    };

    fetchItem();
  }, []);
  return (
    <YStack backgroundColor={"$background"} h={"100%"} w={"100%"} pb={"$8"}>
      <ScrollView>
        <ItemHeaderPicture />
        <YStack
          pos={"relative"}
          bg={"$backgroundFocus"}
          borderTopRightRadius={"$10"}
          borderBottomRightRadius={"$10"}
          py={"$2"}
          px={"$4"}
          pb={"$4"}
          space={"$2"}
        >
          <XStack h={"$11"}>
            {/* Cover */}
            <XStack h={"$13"} left={"$2"} transform={[{ translateY: -50 }]}>
              <Image
                borderWidth={1.4}
                borderColor={"$gray8Dark"}
                resizeMode="cover"
                borderRadius={"$4"}
                aspectRatio={"6/9"}
                source={{
                  uri:
                    getItemCoverSrc(item, user.token, config) ||
                    PLACEHOLDER_IMAGE,
                }}
              />
            </XStack>
            {/* Title & Author */}
            <YStack w={"$18"} h={"$10"} pt={"$2"} pl={"$3"} space={"$2"}>
              <Text numberOfLines={1} color={"$gray8"} fontSize={"$5"}>
                {cleanString(item?.media.metadata.authorName, 25)}
              </Text>
              <Text numberOfLines={2} fontSize={"$7"}>
                {cleanString(item?.media.metadata.title, 30)}
              </Text>
            </YStack>
          </XStack>
          {/* Description */}
          {item?.media.metadata.description && (
            <YStack px={"$3"} space={"$2"}>
              <Text fontSize={"$2"} color={"$gray8"}>
                Description
              </Text>
              <Text numberOfLines={truncate}>
                {item?.media.metadata.description}
              </Text>
              <Text
                color={"$blue11"}
                onPress={() => {
                  if (truncate === 3) setTruncate(200);
                  else setTruncate(3);
                }}
              >
                {truncate === 3 ? "More" : "Less"}
              </Text>
            </YStack>
          )}
          <XStack px={"$3"}>
            <Button
              onPress={() => router.push(`/reader/${item?.id}`)}
              theme="blue"
              w={"100%"}
            >
              <Text>Read</Text>
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default ItemPage;
