import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { Spinner, View } from "tamagui";

import { ScreenCenter } from "../../components/center";
import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { getItemCoverSrc } from "../../utils/api";

const BookPage = () => {
  const { id } = useLocalSearchParams();

  const user = useAtomValue(userAtom);
  const config = useAtomValue(currentServerConfigAtom);

  const [truncate, setTruncate] = useState(3);

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

  if (!bookItem || isLoading) {
    return (
      <ScreenCenter>
        <Spinner />
      </ScreenCenter>
    );
  }

  return <View style={{ flex: 1 }}></View>;
};

export default BookPage;
