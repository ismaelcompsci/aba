import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { getLibraryItem } from "../../api/library";
import { PLACEHOLDER_IMAGE } from "../../constants/data-uris";
import { LibraryItem } from "../../types/server";
import { currentItemAtom } from "../../utils/atoms";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import {
  currentServerConfigAtom,
  currentUserAtom,
} from "../../utils/local-atoms";
import ItemInfo from "../../components/item/item-info";

const ItemHeaderPicture = () => {
  return (
    <XStack h={"$8"}>
      <LinearGradient
        width="100%"
        height="150%"
        colors={["$gray2", "$background"]}
        start={[0, 1]}
        end={[0, 0.1]}
      />
    </XStack>
  );
};

// TODO LOAding state
const ItemPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const user = useAtomValue(currentUserAtom);
  const setCurrentItem = useSetAtom(currentItemAtom);
  const config = useAtomValue(currentServerConfigAtom);

  const [truncate, setTruncate] = useState(3);
  const [item, setItem] = useState<LibraryItem | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const _id = Array.isArray(id) ? id[0] : id;
      const { error, data } = await getLibraryItem(_id);
      setCurrentItem(data);

      if (error) {
        console.log("[ITEM_ERROR]", error);
        setLoading(false);
      }
      setItem(data);
      setLoading(false);
    };

    fetchItem();
  }, []);
  return (
    <YStack backgroundColor={"$background"} h={"100%"} w={"100%"} pb={"$8"}>
      <ScrollView>
        <ItemHeaderPicture />
        <YStack
          borderBottomRightRadius={"$10"}
          borderTopRightRadius={"$10"}
          bg={"$backgroundStrong"}
          pos={"relative"}
          space={"$2"}
          py={"$2"}
          px={"$4"}
          pb={"$8"}
        >
          <XStack h={"$11"}>
            {/* Cover */}
            <XStack
              overflow="hidden"
              h={"$13"}
              p={0}
              m={0}
              w={110}
              left={"$2"}
              transform={[{ translateY: -50 }]}
              borderColor={"$gray8Dark"}
              borderWidth={1.4}
              borderRadius={"$4"}
            >
              {loading ? (
                <Spinner
                  bg={"$background"}
                  h={"100%"}
                  w={"100%"}
                  justifyContent="center"
                />
              ) : (
                <Image
                  aspectRatio={"1/1.5"}
                  resizeMode="cover"
                  flex={1}
                  source={{
                    uri:
                      getItemCoverSrc(item, user.token, config) ||
                      PLACEHOLDER_IMAGE,
                  }}
                />
              )}
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
              chromeless
              onPress={() => router.push(`/reader/${item?.id}`)}
              bg={"$blue10Light"}
              theme={"blue"}
              w={"100%"}
            >
              <Text>Read</Text>
            </Button>
          </XStack>
          {/* INFO */}
          <ItemInfo item={item} />
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default ItemPage;
