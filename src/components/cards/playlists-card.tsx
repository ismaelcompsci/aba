import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";

import { PlaylistExpanded } from "../../types/aba";
import { PlaylistCover } from "../covers/playlist-cover";
import { Flex } from "../layout/flex";

export const PlaylistsCard = ({
  item,
  userToken,
  serverAddress,
  isCoverSquareAspectRatio,
}: {
  item: PlaylistExpanded;
  userToken: string;
  serverAddress: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : 100;

  const handlePress = () => {
    router.push(`/playlists/${item.id}?name=${item.name}`);
  };

  return (
    <YStack
      overflow="hidden"
      justifyContent="flex-end"
      borderColor={"$backgroundFocus"}
      borderWidth={1}
      mt="$4"
      br={"$4"}
      pressStyle={{ scale: 0.875 }}
      animation="bouncy"
      onPress={handlePress}
      elevation={"$0.75"}
      bg={"$background"}
    >
      {/* PHOTOS */}
      <Flex height={bookHeight} width={bookWidth}>
        <PlaylistCover
          item={item}
          userToken={userToken}
          serverAddress={serverAddress}
          bookWidth={bookWidth}
        />
      </Flex>
      {/* name */}
      <XStack
        // w={bookWidth - 2}
        justifyContent="center"
        borderColor={"$color"}
        borderWidth={1}
        borderBottomStartRadius={"$2"}
        borderBottomEndRadius={"$2"}
        bg="$background"
      >
        <Text h={20} numberOfLines={1} fontSize={"$5"} textAlign="center">
          {item.name}
        </Text>
      </XStack>
    </YStack>
  );
};
