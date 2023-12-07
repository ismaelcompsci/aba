import { PlaylistExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { Flex } from "../layout/flex";

import { BookCover } from "./book-cover";

export const PlaylistCover = ({
  item,
  userToken,
  serverAddress,
  bookWidth,
}: {
  item: PlaylistExpanded;
  userToken: string;
  serverAddress: string;
  bookWidth: number;
}) => {
  const getItemCovers = () => {
    if (!item.items.length) return [];

    if (item.items.length === 1) {
      return [item.items[0].libraryItem];
    }

    const covers = [];

    for (let i = 0; i < 4; i++) {
      let index = i % item.items.length;
      if (item.items.length === 2 && i >= 2) index = (i + 1) % 2;

      covers.push(item.items[index].libraryItem);
    }

    return covers;
  };

  const covers = getItemCovers();
  const width = covers.length === 1 ? bookWidth : bookWidth / 2;

  return (
    <Flex fill flexWrap="wrap" row>
      {item.items.length
        ? covers.map((item, i) => {
            const coverUrl = getItemCoverSrc(
              item,
              null,
              userToken,
              serverAddress
            );
            return (
              <BookCover
                key={item.id + String(i)}
                coverUrl={coverUrl}
                bookWidth={width}
                bookHeight={width}
                fastImageProps={{
                  style: {
                    borderRadius: 0,
                  },
                  resizeMode: "contain",
                }}
              />
            );
          })
        : null}
    </Flex>
  );
};
