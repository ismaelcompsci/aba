import FastImage from "react-native-fast-image";
import { User } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Text } from "tamagui";

import { AuthorExpanded } from "../../types/aba";
import { encode } from "../../utils/utils";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

interface AuthorCardProps {
  userToken: string;
  serverAddress: string;
  author: AuthorExpanded;
  width: number;
  height: number;
}

const AuthorCard = ({
  author,
  serverAddress,
  userToken,
  width,
  height,
}: AuthorCardProps) => {
  const authorPress = () => {
    router.push(`/library/authors/${encode(author.id)}?name=${author.name}`);
  };

  return (
    <TouchableArea
      w={width}
      height={height}
      borderRadius={"$4"}
      bg="$backgroundFocus"
      shadowColor="$shadowColor"
      shadowOffset={{
        width: 0,
        height: 5,
      }}
      shadowOpacity={0.36}
      shadowRadius={6.68}
      onPress={authorPress}
    >
      <AuthorImage
        author={author}
        serverAddress={serverAddress}
        userToken={userToken}
      />
      <Flex
        w={"100%"}
        height={"40%"}
        centered
        pos={"absolute"}
        bottom={0}
        bg="rgba(5, 5, 5, 0.6)"
        borderBottomLeftRadius={"$4"}
        borderBottomRightRadius={"$4"}
      >
        <Text
          numberOfLines={2}
          fontWeight={"900"}
          $theme-dark={{
            color: "$gray12",
          }}
          $theme-light={{
            color: "$gray1",
          }}
          $theme-oled={{
            color: "$gray11",
          }}
        >
          {author.name}
        </Text>
      </Flex>
    </TouchableArea>
  );
};

const AuthorImage = ({
  author,
  serverAddress,
  userToken,
}: {
  author: AuthorExpanded;
  userToken: string;
  serverAddress: string;
}) => {
  const cover = author.imagePath
    ? `${serverAddress}/api/authors/${author.id}/image?token=${userToken}`
    : null;

  return (
    <Flex borderRadius={"$4"} overflow="hidden">
      {cover ? (
        <FastImage
          style={{
            height: "100%",
            width: "100%",
          }}
          source={{
            uri: cover,
          }}
        />
      ) : (
        <Flex height={"100%"} width={"100%"} centered>
          <User size={"$10"} />
        </Flex>
      )}
    </Flex>
  );
};

export default AuthorCard;
