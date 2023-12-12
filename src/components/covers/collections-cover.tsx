import { Image } from "react-native";

import { LibraryItemExpanded, LibraryItemMinified } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { Flex } from "../layout/flex";

import { BookCover } from "./book-cover";

export const CollectionCover = ({
  items,
  width,
  height,
  userToken,
  serverAddress,
}: {
  items: LibraryItemMinified[] | LibraryItemExpanded[];
  width: number;
  height: number;
  userToken: string;
  serverAddress: string;
}) => {
  const firstCover = getItemCoverSrc(items[0], null, userToken, serverAddress);
  const secondCover = getItemCoverSrc(items[1], null, userToken, serverAddress);

  return (
    <Flex width={width} height={height} row overflow="hidden" jc={"center"}>
      {firstCover ? (
        <Image
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 8,
          }}
          resizeMode="cover"
          source={{
            uri: firstCover,
          }}
          blurRadius={5}
        />
      ) : null}

      {items.length ? (
        <>
          <BookCover
            bookHeight={height}
            bookWidth={width / 2}
            coverUrl={firstCover}
            fastImageProps={{
              style:
                items.length === 1
                  ? {
                      width: "100%",
                    }
                  : undefined,
            }}
          />
          {items.length > 1 ? (
            <BookCover
              bookHeight={height}
              bookWidth={width / 2}
              coverUrl={secondCover}
            />
          ) : null}
        </>
      ) : null}
    </Flex>
  );
};
