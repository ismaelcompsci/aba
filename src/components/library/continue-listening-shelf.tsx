import React, { useEffect } from "react";
import { FlatList } from "react-native";
import { SlideInUp, useSharedValue, withTiming } from "react-native-reanimated";
import { useAtomValue } from "jotai";

import {
  isCoverSquareAspectRatioAtom,
  requestInfoAtom,
} from "../../state/app-state";
import { PersonalizedView } from "../../types/types";
import { AnimatedFlex, Flex } from "../layout/flex";
import { ShelfCard } from "../cards/shelf-card";

export const ContinueListeningShelf = ({
  shelf,
}: {
  shelf: PersonalizedView;
}) => {
  const requestInfo = useAtomValue(requestInfoAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(324 + 20, { duration: 500 });
  }, []);

  if (!shelf.entities.length) return null;

  return (
    <AnimatedFlex
      entering={SlideInUp}
      style={{
        height,
      }}
    >
      <FlatList
        horizontal
        ItemSeparatorComponent={() => <Flex w={10} />}
        showsHorizontalScrollIndicator={false}
        data={shelf.entities}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 12,
          columnGap: 12,
        }}
        keyExtractor={(item) =>
          (item.recentEpisode ? item.recentEpisode.id : item.id) + "home-"
        }
        renderItem={({ item }) => {
          return (
            <ShelfCard
              item={item}
              serverAddress={requestInfo.serverAddress}
              token={requestInfo.token}
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            />
          );
        }}
      />
    </AnimatedFlex>
  );
};
