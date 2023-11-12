import { useState } from "react";
import FastImage from "react-native-fast-image";
import { User } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Stack, Text } from "tamagui";

import { AuthorExpanded } from "../../types/aba";
import { encode } from "../../utils/utils";

import { SearchCard } from "./search-card";

const AuthorSearchCard = ({
  author,
  token,
  serverAddress,
}: {
  author: AuthorExpanded;
  serverAddress: string;
  token?: string;
}) => {
  /**
   * this url crashes server
   * &ts=13945811243 <- culprit ???
   * http://192.168.1.158:54932/api/authors/535ebe53-5ec5-4a3f-8d31-d8c388ef0934/image?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs&ts=1683288160590
   */
  const [error, setError] = useState(true);
  const authorImg = `${serverAddress}/api/authors/${author.id}/image?token=${token}`;

  const imageWidth = 60;
  const imageHeight = 80;
  const handlePress = () => {
    router.push(`/library/authors/${encode(author.id)}`);
  };
  return (
    <SearchCard onPress={handlePress} h={imageHeight}>
      {error ? (
        <Stack
          borderRadius={"$4"}
          bg={"$backgroundFocus"}
          jc="center"
          ai="center"
          w={imageWidth}
          h={imageHeight}
        >
          <User size={"$5"} />
        </Stack>
      ) : (
        <FastImage
          onError={() => setError(true)}
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
          resizeMode="contain"
          source={{
            uri: authorImg,
          }}
        />
      )}
      <Text>{author.name}</Text>
    </SearchCard>
  );
};

export default AuthorSearchCard;
