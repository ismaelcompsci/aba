import React from "react";
import { FlatList } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAtomValue } from "jotai";

import { IS_IOS } from "../../constants/consts";
import {
  isCoverSquareAspectRatioAtom,
  requestInfoAtom,
} from "../../state/app-state";
import { PersonalizedView } from "../../types/types";
import { ShelfCard } from "../cards/shelf-card";
import { Flex } from "../layout/flex";

export const ContinueListeningShelf = ({
  shelf,
}: {
  shelf: PersonalizedView;
}) => {
  const requestInfo = useAtomValue(requestInfoAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  if (!shelf.entities.length) return null;

  return (
    <Flex
      style={{
        height: 324 + 20,
      }}
    >
      {IS_IOS ? (
        <FlashList
          horizontal
          ItemSeparatorComponent={() => <Flex w={10} />}
          showsHorizontalScrollIndicator={false}
          data={shelf.entities}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 12,
            paddingBottom: 12,
          }}
          estimatedItemSize={258}
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
      ) : (
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
      )}
    </Flex>
  );
};
