import { router } from "expo-router";
import { Text } from "tamagui";

import { CollectionMinified } from "../../types/aba";
import { CollectionCover } from "../covers/collections-cover";
import { Flex } from "../layout/flex";

interface CollectionCardProps {
  item: CollectionMinified;
  isCoverSquareAspectRatio: boolean;
  serverAddress: string;
  userToken: string;
}

const CollectionCard = ({
  item,
  isCoverSquareAspectRatio,
  serverAddress,
  userToken,
}: CollectionCardProps) => {
  const bookWidth = isCoverSquareAspectRatio ? 1.6 * 100 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  const handlePress = () => {
    router.push(`/collection/${item.id}`);
  };

  return (
    <Flex
      w={bookWidth * 2}
      h={bookHeight}
      borderTopLeftRadius="$4"
      borderTopRightRadius="$4"
      borderBottomEndRadius={"$2.5"}
      borderBottomStartRadius={"$2.5"}
      overflow="hidden"
      borderColor={"$backgroundFocus"}
      borderWidth={1}
      pressStyle={{ scale: 0.875 }}
      animation="bouncy"
      onPress={handlePress}
      accessible
      accessibilityLabel={`${item.name} collection`}
    >
      <Flex w="100%" h="100%" overflow="hidden">
        <CollectionCover
          items={item.books ? item.books || [] : []}
          width={bookWidth * 2}
          height={bookHeight}
          serverAddress={serverAddress}
          userToken={userToken}
        />
      </Flex>
      <Flex
        height={24}
        width="100%"
        jc="center"
        alignItems="center"
        bg={"$background"}
        borderBottomLeftRadius={"$4"}
        borderBottomRightRadius={"$4"}
        borderColor={"$color"}
        borderWidth={"$0.25"}
        pos={"absolute"}
        bottom={0}
      >
        <Text>{item.name}</Text>
      </Flex>
    </Flex>
  );
};

export default CollectionCard;
