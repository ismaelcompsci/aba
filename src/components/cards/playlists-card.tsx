import { router } from "expo-router";
import { Text } from "tamagui";

import { PlaylistExpanded } from "../../types/aba";
import { PlaylistCover } from "../covers/playlist-cover";
import { Flex } from "../layout/flex";

export const PlaylistsCard = ({
  item,
  userToken,
  serverAddress,
}: {
  item: PlaylistExpanded;
  userToken: string;
  serverAddress: string;
}) => {
  const bookWidth = 100 * 1.6;
  const bookHeight = bookWidth;

  const handlePress = () => {
    router.push(`/playlists/${item.id}?name=${item.name}`);
  };

  return (
    <Flex
      overflow="hidden"
      justifyContent="flex-end"
      borderColor={"$backgroundFocus"}
      borderWidth={1}
      mt="$4"
      br={"$4"}
      pressStyle={{ scale: 0.875 }}
      animation="bouncy"
      onPress={handlePress}
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
      <Flex
        row
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
      </Flex>
    </Flex>
  );
};
