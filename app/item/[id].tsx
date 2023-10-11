import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useEffect, useState } from "react";
import { Button, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { getLibraryItem } from "../../api/library";
import {
  currentItemAtom,
  currentLibraryAtom,
  currentUserAtom,
} from "../../utils/atoms";
import { cleanString, getItemCoverSrc } from "../../utils/helpers";
import { currentServerConfigAtom } from "../../utils/local-atoms";
import ItemInfo from "../../components/item/item-info";
import { LibraryItemExpanded } from "../../types/adbs";
import ItemImage from "../../components/item-image";

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
  const lib = useAtomValue(currentLibraryAtom);

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  const [truncate, setTruncate] = useState(3);
  const [item, setItem] = useState<LibraryItemExpanded | null>();
  const [loading, setLoading] = useState(false);

  const cover = getItemCoverSrc(item, config, user?.token);
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.2 : 100;
  const bookHeigth = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.4;
  const isMissing = item?.isMissing;
  const isInvalid = item?.isInvalid;
  const subtitle =
    item && "subtitle" in item.media.metadata
      ? item.media.metadata.subtitle
      : null;

  const canShowPlay = () => {
    if (!item || isMissing || isInvalid) return false;
    if ("tracks" in item.media && item.media.tracks) {
      return !!item.media.tracks.length;
    }
    if ("episodes" in item.media && item.media.episodes) {
      return !!item.media.episodes.length;
    }
    return false;
  };

  const canShowRead = () => {
    if (!item || isMissing || isInvalid) return false;

    if ("ebookFile" in item?.media && item?.media.ebookFile) {
      return true;
    }

    return false;
  };

  const showPlay = canShowPlay();
  const showRead = canShowRead();

  const author = () => {
    if (!item) return null;

    if ("author" in item.media.metadata) return item?.media.metadata.author;
    return item?.media.metadata.authorName;
  };

  const actionButton = () => {
    if (showPlay) {
      return (
        <Button
          chromeless
          onPress={() => console.log("TODO: OPEN PLAYER")}
          bg={"$green10Dark"}
          theme={"blue"}
          w={"100%"}
        >
          <Text>Play</Text>
        </Button>
      );
    } else if (showRead) {
      return (
        <Button
          chromeless
          onPress={() => router.push(`/reader/${item?.id}`)}
          bg={"$blue10Light"}
          theme={"blue"}
          w={"100%"}
        >
          <Text>Read</Text>
        </Button>
      );
    } else if (isMissing || isInvalid) {
      return (
        <Button
          chromeless
          onPress={() => console.log("ITEM IS MISSING")}
          bg={"$red10Dark"}
          theme={"blue"}
          w={"100%"}
        >
          <Text>Missing</Text>
        </Button>
      );
    }
  };

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
    <YStack
      backgroundColor={"$background"}
      h={"100%"}
      w={"100%"}
      pb={"$8"}
      justifyContent="center"
    >
      {loading && <Spinner alignSelf="center" />}
      {!loading && (
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
                h={bookHeigth}
                p={0}
                m={0}
                w={bookWidth}
                left={"$2"}
                transform={[{ translateY: -50 }]}
                borderColor={"$gray8Dark"}
                borderWidth={1.4}
                borderRadius={"$4"}
              >
                <ItemImage
                  cover={cover}
                  bookHeight={bookHeigth}
                  bookWidth={bookWidth}
                  title={item?.media.metadata.title || ""}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              </XStack>
              {/* Author & Title & Subtitle */}
              <YStack
                w={"$18"}
                h={"$6"}
                pr={"$6"}
                pt={"$2"}
                pl={"$3"}
                space={"$2"}
              >
                <Text numberOfLines={1} color={"$color.gray10"} fontSize={"$5"}>
                  {cleanString(author(), 25)}
                </Text>
                <Text numberOfLines={2} fontSize={"$6"}>
                  {cleanString(item?.media.metadata.title, 40)}
                </Text>
                {subtitle && (
                  <Text
                    color={"$color.gray10Light"}
                    fontSize={"$1"}
                    fontWeight={"300"}
                  >
                    {subtitle}
                  </Text>
                )}
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
                    if (truncate === 3) setTruncate(300);
                    else setTruncate(3);
                  }}
                >
                  {truncate === 3 ? "More" : "Less"}
                </Text>
              </YStack>
            )}
            <XStack px={"$3"}>{actionButton()}</XStack>
            {/* INFO */}
            <ItemInfo item={item} />
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
};

export default ItemPage;
