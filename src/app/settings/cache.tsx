import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import RNFetchBlob from "rn-fetch-blob";
import { Spinner, Text } from "tamagui";

import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { TouchableArea } from "../../components/touchable/touchable-area";
import { epubDir } from "../../constants/consts";
import { humanFileSize } from "../../utils/utils";

/**
 * todo better ui
 */

const Cache = () => {
  const [loading, setLoading] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  const getCacheSize = async () => {
    try {
      setLoading(true);
      let size = 0;
      const cachedFilesStats = await RNFetchBlob.fs.lstat(epubDir);

      for (let i = 0; i < cachedFilesStats.length; i++) {
        const sizeNumber = Number(
          cachedFilesStats[i].size as unknown as string
        );
        size += sizeNumber;
      }

      setCacheSize(size);

      return size;
    } catch (error) {
      console.log("[CACHE] getCacheSize error", error);
      setCacheSize(0);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      await RNFetchBlob.fs.unlink(epubDir);
      await FastImage.clearDiskCache();
      await FastImage.clearMemoryCache();

      await getCacheSize();
    } catch (error) {
      console.log("[CACHE] clearCache error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCacheSize();
  }, []);

  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize={"$6"}>Storage</Text>
      </BackHeader>
      <Flex fill p={24}>
        <TouchableArea
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          py={12}
          onPress={clearCache}
        >
          <Text fontSize={18} lineHeight={24} fontWeight={"400"} color="$red10">
            Clear ebook file cache
          </Text>
          {!loading ? (
            <Text color="$gray11">{humanFileSize(cacheSize)}</Text>
          ) : (
            <Spinner />
          )}
        </TouchableArea>
      </Flex>
    </Screen>
  );
};

export default Cache;
