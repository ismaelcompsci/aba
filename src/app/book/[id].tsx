import React, { useState } from "react";
import { Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "@react-native-community/blur";
import { ChevronLeft, MoreHorizontal } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import {
  Button,
  H3,
  Image,
  Spinner,
  Text,
  useTheme,
  View,
  XStack,
} from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

import { ClearIconButton } from "../../components/buttons/button";
import { ScreenCenter } from "../../components/center";
import { ParallaxScrollView } from "../../components/custom-components/parallax-scroll-view";
import { HEADER_HEIGHT } from "../../hooks/use-header-height";
import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { getItemCoverSrc } from "../../utils/api";

const layout = Dimensions.get("window");

const BookPage = () => {
  const { id } = useLocalSearchParams();

  const user = useAtomValue(userAtom);
  const config = useAtomValue(currentServerConfigAtom);

  const [truncate, setTruncate] = useState(3);

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const bg = theme.background.get();
  const IHeight = 400;

  const { data: bookItem, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const response = await axios.get(
        `${config.serverAddress}/api/items/${id}`,
        {
          params: {
            expanded: 1,
            include: "rssfeed",
          },
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      return response.data;
    },
  });

  const cover = getItemCoverSrc(bookItem, config, user?.token);

  const renderParallaxHeader = (value: Animated.Value) => {
    return (
      <View w={"100%"} h={"100%"}>
        <>
          <Image
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            resizeMode={"cover"}
            source={{
              uri: cover || "",
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
        <Animated.Image
          resizeMode={"contain"}
          style={{
            position: "absolute",
            top: -10,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 50,
            // transform: [{ translateY }],
          }}
          source={{
            uri: cover || "",
          }}
        />
      </View>
    );
  };
  const renderFixedHeader = (value: Animated.Value) => {
    const opacity = value.interpolate({
      inputRange: [0, 150, 200],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });

    return (
      <View height={HEADER_HEIGHT} width="100%">
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: bg,
            },
            { opacity },
          ]}
        />
        <XStack height={HEADER_HEIGHT} width="100%" pt={44}>
          <ClearIconButton
            display="flex"
            flexDirection="row"
            onPress={() => router.back()}
          >
            <ChevronLeft />
            <Text>Go Back</Text>
          </ClearIconButton>
        </XStack>
      </View>
    );
  };

  if (!bookItem || isLoading) {
    return (
      <ScreenCenter>
        <Spinner />
      </ScreenCenter>
    );
  }

  console.log({ b: theme.background });

  return (
    <View flex={1} bg={"$background"}>
      <ParallaxScrollView
        style={{ flex: 1 }}
        parallaxHeaderHeight={IHeight}
        parallaxHeader={renderParallaxHeader}
        fixedHeader={renderFixedHeader}
        showsVerticalScrollIndicator={false}
      >
        <View w="100%" bg="$background" paddingBottom={insets.bottom}>
          <LinearGradient
            colors={[bg, bg + "33", bg + "00"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: "absolute",
              height: 100,
              width: layout.width,
              marginTop: -100,
            }}
          />
          <View minHeight={layout.height - IHeight}>
            <View px={10}>
              <H3 numberOfLines={3} mt={-20}>
                {bookItem.media.metadata.title}
              </H3>
              <Text numberOfLines={2} bg={"$background"} color={"$gray10"}>
                {bookItem.media.metadata.authorName}
              </Text>
              <XStack
                bg={"$background"}
                py={"$2"}
                gap={"$1"}
                justifyContent="space-between"
              >
                <Button flex={1}>Read now</Button>
                <XStack flex={1} justifyContent="flex-end">
                  <Button>
                    <MoreHorizontal />
                  </Button>
                </XStack>
              </XStack>
              <Text bg={"$background"}>
                {bookItem.media.metadata.description}
              </Text>
            </View>
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  );
};

export default BookPage;
