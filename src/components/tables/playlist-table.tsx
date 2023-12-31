import { useState } from "react";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Spinner, Text } from "tamagui";

import { PlaylistExpanded, PlaylistItemExpanded } from "../../types/aba";
import { getBorderRadius } from "../../utils/ui";
import { Flex } from "../layout/flex";

import { PlaylistItemRow } from "./playlist-item-row";

export const PlaylistTable = ({
  data,
  userToken,
  serverAddress,
}: {
  data: PlaylistExpanded;
  userToken: string;
  serverAddress: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const [items, setItems] = useState<PlaylistItemExpanded[]>(data.items);

  const { mutate } = useMutation({
    mutationKey: ["update-playlist"],
    mutationFn: async (items: PlaylistItemExpanded[]) => {
      const response = await axios.patch(
        `${serverAddress}/api/playlists/${data.id}`,
        { items },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      return response.data as PlaylistExpanded;
    },
    onSuccess: async (data) => {
      // console.log(data.name);
      queryClient.setQueryData(
        ["single-playlist", data.id],
        (oldData: PlaylistExpanded | undefined) => {
          if (oldData) {
            return data;
          }

          return oldData;
        }
      );

      await Promise.all([queryClient.invalidateQueries(["playlists-page"])]);
      setIsLoading(false);
    },
  });

  return (
    <Flex bg="$backgroundHover" px="$2" borderRadius={"$4"} pb={"$4"} fill>
      {isLoading ? (
        <Flex
          pos={"absolute"}
          w="100%"
          height={"100%"}
          centered
          zIndex={100000}
        >
          <Spinner />
        </Flex>
      ) : null}
      <Flex justifyContent="space-between" row alignItems="center" py="$4">
        <Text fontSize={24} $gtMd={{ fontSize: 34 }}>
          {data.name}
        </Text>
        <Flex p="$2" borderRadius={"$10"} bg={"$backgroundFocus"}>
          <Text
            $gtMd={{
              fontSize: 18,
            }}
          >
            {data.items.length}
          </Text>
        </Flex>
      </Flex>

      <Flex
        bg="$backgroundHover"
        fill
        borderRadius="$4"
        px="$1"
        pointerEvents={isLoading ? "none" : undefined}
        opacity={isLoading ? 0.1 : 1}
      >
        <DraggableFlatList
          data={items}
          onDragEnd={({ data }) => {
            setIsLoading(true);

            setItems(data);
            mutate(data);
          }}
          keyExtractor={(playlistItem, i) =>
            playlistItem.episodeId
              ? playlistItem.episodeId + String(i)
              : playlistItem.libraryItemId + String(i)
          }
          renderItem={({ item, drag, isActive, getIndex }) => {
            const index = getIndex();
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const borderRadius = getBorderRadius({
              isFirst,
              isLast,
              vertical: true,
              radius: "$4",
              disable: false,
            });

            return (
              <ScaleDecorator activeScale={1.04}>
                <PlaylistItemRow
                  delayLongPress={100}
                  onLongPress={drag}
                  disabled={isActive}
                  playlistItem={item}
                  serverAddress={serverAddress}
                  userToken={userToken}
                  {...borderRadius}
                />
              </ScaleDecorator>
            );
          }}
        />
      </Flex>
    </Flex>
  );
};
