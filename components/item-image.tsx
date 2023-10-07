import { BlurView } from "@react-native-community/blur";
import { useState } from "react";
import { ImageLoadEventData, NativeSyntheticEvent } from "react-native";
import { Card, Image, Stack, Text } from "tamagui";
import { PLACEHOLDER_IMAGE } from "../constants/data-uris";
import { cleanString } from "../utils/helpers";

interface ItemImageProps {
  cover: string | null | undefined;
  bookHeight: number;
  bookWidth: number;
  isCoverSquareAspectRatio: boolean;
  title: string;
}

const ItemImage = ({
  cover,
  bookHeight,
  bookWidth,
  isCoverSquareAspectRatio,
  title,
}: ItemImageProps) => {
  const [showCoverBg, setShowCoverBg] = useState(false);

  const handleImageOnLoad = ({
    nativeEvent: {
      source: { width, height },
    },
  }: NativeSyntheticEvent<ImageLoadEventData>) => {
    const aspectRatio = height / width;
    const diff = Math.abs(
      aspectRatio - (isCoverSquareAspectRatio === true ? 1 : 0)
    );

    if (diff > 0.15) {
      setShowCoverBg(true);
    } else {
      setShowCoverBg(false);
    }
  };

  const resizeMode = () => {
    if (showCoverBg && isCoverSquareAspectRatio) {
      return "contain";
    } else {
      return "stretch";
    }
  };
  return (
    <>
      {cover ? (
        <Stack
          overflow="hidden"
          h={bookHeight}
          w={bookWidth}
          p={0}
          m={0}
          borderRadius={"$4"}
        >
          {isCoverSquareAspectRatio && (
            <>
              <Image
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                onLoad={handleImageOnLoad}
                resizeMode={"cover"}
                source={{
                  uri: cover,
                }}
              />
              <BlurView
                style={{
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
                blurType="light"
                blurAmount={3}
                reducedTransparencyFallbackColor="white"
              />
            </>
          )}
          <Image
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            onLoad={handleImageOnLoad}
            zIndex={"$3"}
            resizeMode={resizeMode()}
            source={{
              uri: cover,
            }}
          />
        </Stack>
      ) : (
        <Card
          h={bookHeight}
          w={bookWidth}
          bordered
          bg={"$backgroundHover"}
          justifyContent="center"
          borderRadius={"$4"}
        >
          <Text zIndex={10} textAlign="center" color={"white"} fontSize={"$5"}>
            {cleanString(title, 60)}
          </Text>
          <Card.Background>
            <Image
              zIndex={-20}
              borderRadius={"$4"}
              resizeMode={resizeMode()}
              alignSelf="center"
              source={{
                width: bookWidth,
                height: bookHeight,
                uri: PLACEHOLDER_IMAGE,
              }}
            />
          </Card.Background>
        </Card>
      )}
    </>
  );
};

export default ItemImage;
