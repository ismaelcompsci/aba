import { BlurView } from "@react-native-community/blur";
import { useEffect, useState } from "react";
import { ImageLoadEventData, NativeSyntheticEvent } from "react-native";
import { Card, Image, Stack, Text } from "tamagui";
import { PLACEHOLDER_IMAGE } from "../constants/data-uris";
import { cleanString } from "../utils/helpers";
import RNFetchBlob from "rn-fetch-blob";
import { imageCacheDir } from "../utils/folders";

interface ItemImageProps {
  cover: string | null | undefined;
  bookHeight: number;
  bookWidth: number;
  isCoverSquareAspectRatio: boolean;
  title: string;
  itemId: string;
  coverFileType?: string;
}

/** use
 * https://github.com/DylanVann/react-native-fast-image
 */
const ItemImage = ({
  cover,
  bookHeight,
  bookWidth,
  isCoverSquareAspectRatio,
  title,
  itemId,
  coverFileType,
}: ItemImageProps) => {
  const [bookCoverUri, setBookCoverUri] = useState<string | null>(null);
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

  useEffect(() => {
    if (!cover) return;
    /**
     * this will go and look for that unique, URL based key in our filesystem
      -> if it finds it -> return the local key
      -> if not -> download it first and write to system
     */
    (async () => {
      /** TODO
       * possible error with hasImageCacheDir
       * move creation of folders in root startup?
       */
      const imagePath = imageCacheDir + "/" + itemId + "." + coverFileType;
      const imageInCache = await RNFetchBlob.fs.exists(imagePath);

      if (imageInCache) {
        setBookCoverUri(imagePath);
      } else {
        const response = await RNFetchBlob.fetch("GET", cover);
        await RNFetchBlob.fs.writeFile(imagePath, response.base64(), "base64");
        setBookCoverUri(imagePath);
      }
    })();
  }, [cover, itemId]);

  return (
    <>
      {bookCoverUri ? (
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
                  uri: bookCoverUri,
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
            zIndex={"$3"}
            // onLoad={handleImageOnLoad}
            resizeMode={resizeMode()}
            source={{
              uri: bookCoverUri,
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
          {/* <Card.Background>
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
          </Card.Background> */}
        </Card>
      )}
    </>
  );
};

export default ItemImage;
