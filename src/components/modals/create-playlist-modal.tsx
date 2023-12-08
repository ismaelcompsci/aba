import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Button, Input, Label, Spinner } from "tamagui";

import {
  createPlaylistModalAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { Modal } from "../custom-components/modal";
import { Flex } from "../layout/flex";

export const CreatePlaylistModal = () => {
  const [value, setValue] = useState("");
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const [createPlaylist, setCreatePlaylist] = useAtom(createPlaylistModalAtom);
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const { mutate: makeNewPlaylist, isLoading } = useMutation({
    mutationKey: ["create-playlist"],
    mutationFn: async () => {
      const response = await axios.post(
        `${serverAddress}/api/playlists`,
        {
          libraryId: createPlaylist.libraryId,
          name: value,
          items: [
            {
              libraryItemId: createPlaylist.libraryItemId,
              episodeId: createPlaylist.episodeId,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "playlists-modal",
        createPlaylist.libraryId,
      ]);
      await queryClient.invalidateQueries([
        "playlists",
        createPlaylist.libraryId,
      ]);

      // adds the playlist tab if the previous query had no playlists
      queryClient.setQueryData(
        ["has-playlists", createPlaylist.libraryId],
        (oldData: boolean | undefined) => {
          if (oldData) {
            return oldData;
          }
          queryClient.invalidateQueries(["has-playlists"]);
          return oldData;
        }
      );

      setValue("");
      setCreatePlaylist({ open: false });
    },
  });

  if (!createPlaylist.open) return null;

  return (
    <Modal
      hide={() => setCreatePlaylist({ open: false })}
      visible
      showCloseButton
      dimBackground
      transparent
      animationType="fade"
      title="Create a playlist"
    >
      <Flex width={width * 0.8} opacity={isLoading ? 0.7 : 1}>
        <Label>Name</Label>
        <Input value={value} onChangeText={setValue} />
        {/* @ts-ignore */}
        <Button mt="$5" disabled={isLoading} onPress={makeNewPlaylist}>
          Submit
          {isLoading ? <Spinner /> : null}
        </Button>
      </Flex>
    </Modal>
  );
};
