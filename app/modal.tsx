import { useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import {
  NavigationState,
  SceneMap,
  SceneRendererProps,
  TabView,
} from "react-native-tab-view";
import { Button, Text, ToggleGroup, View, XStack, YStack } from "tamagui";
import { IconButton } from "../components/ui/button";
import { Home, Library, X } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtomValue } from "jotai/react";
import { bookTocAtom } from "../utils/atoms";

const OverviewPage = () => {
  return (
    <YStack bg={"$backgroundFocus"} h={"100%"} px={"$2"}>
      <YStack>
        <Text>Overview</Text>
      </YStack>
    </YStack>
  );
};

interface ContentsPageProps {
  toc: any[];
}

const ContentsPage = ({ toc }: ContentsPageProps) => {
  return (
    <YStack bg={"$backgroundFocus"} h={"100%"} px={"$2"}>
      <YStack pb={"$6"}>
        <FlatList
          data={toc}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <XStack>
                <Text>{item.label}</Text>
              </XStack>
            );
          }}
        />
      </YStack>
    </YStack>
  );
};

export default function Overview() {
  const bookToc = useAtomValue<any[]>(bookTocAtom);
  const flatBookToc = [];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "overview", title: "Overview" },
    { key: "contents", title: "Contents" },
  ]);

  const layout = useWindowDimensions();

  bookToc?.flatMap((item, i) => {
    if (item.subitems?.length > 0) {
      return item.subitems.map((subitem: any) => {
        flatBookToc.push({
          href: subitem.href,
          id: subitem.id,
          label: subitem.label,
        });
        // this.#tocMap.set(count, { label: subitem?.label, id: subitem?.id });
      });
    } else {
      flatBookToc.push({ href: item.href, id: item.id, label: item.label });
    }
  });

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "overview":
        return <OverviewPage />;
      case "contents":
        return <ContentsPage toc={flatBookToc} />;
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & {
      navigationState: NavigationState<{ key: string; title: string }>;
    }
  ) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const index = props.navigationState.index;

    const key = props.navigationState.routes[props.navigationState.index].key;

    return (
      <XStack
        alignItems="center"
        py={"$2"}
        px={"$3"}
        justifyContent="center"
        w={"100%"}
        bg={"$backgroundFocus"}
        pt={"$4"}
      >
        <ToggleGroup
          theme={"blue"}
          size={"$5"}
          w={"100%"}
          h={"$4"}
          orientation="horizontal"
          type="single"
          value={key}
        >
          <ToggleGroup.Item
            onPress={() => {
              setIndex(0);
            }}
            value="overview"
            flex={1}
          >
            {/* @ts-ignore*/}
            <Home color={index === 0 ? "$blue10" : null} />
            <Text>Overview</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            onPress={() => {
              setIndex(1);
            }}
            value="contents"
            flex={1}
          >
            {/* @ts-ignore*/}
            <Library color={index === 1 ? "$blue10" : null} />
            <Text>Contents</Text>
          </ToggleGroup.Item>
        </ToggleGroup>
        <View
          pos={"absolute"}
          right={-100}
          top={-30}
          height={70}
          width={200}
          transform={"rotate(45deg)"}
          backgroundColor={"$background"}
        >
          <View
            left={85}
            pos={"absolute"}
            transform={"rotate(45deg)"}
            bottom={0}
            zIndex={"$5"}
            onPress={() => router.back()}
          >
            <X />
          </View>
        </View>
      </XStack>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderTabBar={renderTabBar}
      initialLayout={{ width: layout.width }}
      renderScene={renderScene}
    />
  );
}
