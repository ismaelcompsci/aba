import { useState } from "react";
import FastImage, { FastImageProps } from "react-native-fast-image";
import { BookX } from "@tamagui/lucide-icons";

import { Flex } from "../layout/flex";

export const BookCover = ({
  coverUrl,
  bookWidth,
  bookHeight,
  fastImageProps = {},
}: {
  coverUrl?: string | null;
  bookWidth: number;
  bookHeight: number;
  fastImageProps?: FastImageProps;
}) => {
  const [error, setError] = useState(false);

  const { style } = fastImageProps;

  if (!coverUrl || error) {
    return (
      <Flex
        width={bookWidth}
        height={bookHeight}
        centered
        borderWidth={1}
        borderColor={"#282828"}
        borderRadius={8}
      >
        <BookX size="$10" />
      </Flex>
    );
  } else {
    return (
      <FastImage
        {...fastImageProps}
        resizeMode={
          fastImageProps.resizeMode ? fastImageProps.resizeMode : "contain"
        }
        onError={() => setError(true)}
        source={{
          uri: coverUrl,
          priority: "low",
        }}
        style={[
          {
            borderRadius: 8,
            width: bookWidth,
            height: bookHeight,
            alignSelf: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#282828",
          },
          style,
        ]}
      />
    );
  }
};
