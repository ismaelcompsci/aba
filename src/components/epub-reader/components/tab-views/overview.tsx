import React from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { H3, Image, ScrollView, Text, useTheme } from "tamagui";

import { useAppSafeAreas } from "../../../../hooks/use-app-safe-areas";
import { AuthorText } from "../../../author-text";
import { Flex } from "../../../layout/flex";
import { useReader } from "../../rn-epub-reader";

export const Overview = () => {
  const { cover, getMeta } = useReader();
  const epubReaderMetadata = getMeta();
  const { width, height } = useWindowDimensions();
  const { bottom } = useAppSafeAreas();
  const colors = useTheme();

  const author = () => {
    if (Array.isArray(epubReaderMetadata.author)) {
      if (typeof epubReaderMetadata.author[0] === "object") {
        return epubReaderMetadata.author[0].name;
      }
      return epubReaderMetadata.author[0];
    }

    if (typeof epubReaderMetadata.author === "object") {
      return epubReaderMetadata.author.name;
    }

    if (typeof epubReaderMetadata.author === "string") {
      return epubReaderMetadata.author;
    }
  };

  const title = () => {
    if (typeof epubReaderMetadata.title === "object") {
      return epubReaderMetadata.title.name;
    }

    if (typeof epubReaderMetadata.title === "string") {
      return epubReaderMetadata.title;
    }
  };
  const dateString = new Date(
    epubReaderMetadata.published || ""
  ).toDateString();

  return (
    <ScrollView
      flex={1}
      bg="$background"
      padding="$2"
      showsVerticalScrollIndicator={false}
      width={width}
      space
      $platform-android={{
        paddingTop: "$10",
      }}
    >
      <Flex pb={bottom}>
        <Flex row>
          {cover ? (
            <Image
              resizeMode="cover"
              borderRadius="$4"
              source={{
                uri: `data:image/png;base64,${cover}`,
                width: Math.min(width * 0.5, 300),
                height: height * 0.35,
              }}
            />
          ) : null}
          <Flex fill padding={"$2"}>
            <Flex fill>
              <H3>{title()}</H3>
              <AuthorText>{author()}</AuthorText>
            </Flex>
            <Flex>
              <Text color={"$gray11"}>{dateString}</Text>
              <Text color={"$gray11"}>{epubReaderMetadata.identifier}</Text>
              <Text color={"$gray11"}>{epubReaderMetadata.publisher}</Text>
            </Flex>
          </Flex>
        </Flex>
        {epubReaderMetadata.description ? (
          <RenderHtml
            tagsStyles={{ body: { color: colors.color.get() } }}
            contentWidth={width}
            source={{ html: epubReaderMetadata.description }}
          />
        ) : null}
      </Flex>
    </ScrollView>
  );
};
