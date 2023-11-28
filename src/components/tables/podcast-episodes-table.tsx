import { FlatList, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import { ArrowDownWideNarrow, Filter, Search } from "@tamagui/lucide-icons";
import { Text, useTheme } from "tamagui";

import { PodcastEpisodeExpanded } from "../../types/aba";
import { secondsToTimestamp } from "../../utils/utils";
import { Flex } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

const PodcastEpisodesTable = ({
  episodes,
}: {
  episodes: PodcastEpisodeExpanded[];
}) => {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const gray12 = theme.gray12.get();

  const renderItem = ({ item }: { item: PodcastEpisodeExpanded }) => {
    const subtitle = item.subtitle || item.description || "";
    const duration = secondsToTimestamp(item.duration);

    return (
      <Flex>
        <Text fontSize={17}>{item.title}</Text>
        <RenderHTML
          contentWidth={width}
          baseStyle={{
            overflow: "hidden",
            height: 50,
            color: gray12,
          }}
          source={{ html: subtitle }}
          enableExperimentalMarginCollapsing
          enableExperimentalBRCollapsing
        />
      </Flex>
    );
  };
  return (
    <Flex fill pt="$4">
      <Flex row space>
        <Text fontSize={20}>Episodes ({episodes.length})</Text>
        <Flex grow />
        <TouchableArea>
          <Search size={"$1"} />
        </TouchableArea>
        <TouchableArea>
          <Filter size={"$1"} />
        </TouchableArea>
        <TouchableArea>
          <ArrowDownWideNarrow />
        </TouchableArea>
      </Flex>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </Flex>
  );
};

export default PodcastEpisodesTable;
