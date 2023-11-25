import { StyleSheet, View } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LineChart } from "react-native-wagmi-charts";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useAtomValue } from "jotai";
import { Text } from "tamagui";

import VirtualScrollView from "../../components/custom-components/virtual-scroll-view";
import BackHeader from "../../components/layout/back-header";
import { AnimatedFlex, Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { TouchableArea } from "../../components/touchable/touchable-area";
import useChartDimensions from "../../hooks/use-chart-dimensions";
import useIconTheme from "../../hooks/use-icon-theme";
import { StatsDuration, useUserStats } from "../../hooks/use-user-stats";
import { mediaProgressAtom } from "../../state/app-state";
import { ListeningStats } from "../../types/types";

const UserPage = () => {
  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} py={16}>
        <Text fontSize={18}>User</Text>
      </BackHeader>
      <VirtualScrollView>
        <Flex gap={16} pt={12}>
          <Flex gap={16} space={4}>
            <Stats />
          </Flex>
        </Flex>
      </VirtualScrollView>
    </Screen>
  );
};

const TIME_DURATIONS = [
  [StatsDuration.Hour, "1H"],
  [StatsDuration.Day, "1D"],
  [StatsDuration.Week, "1W"],
  [StatsDuration.Month, "1M"],
  [StatsDuration.Year, "1Y"],
] as const;

const Stats = () => {
  const { statsData, setDuration, empty, selectedDuration } = useUserStats();

  return (
    <Flex overflow="hidden" space="$4">
      <StatsDetailHeader listeningStats={statsData.allStats} />
      <StatsChart statsData={statsData.chartData} empty={empty} />
      <StatsChartTimeLabels
        setDuration={setDuration}
        selectedDuration={selectedDuration}
      />
    </Flex>
  );
};

const StatsChart = ({
  statsData,
  empty,
}: {
  statsData: { timestamp: number; value: number }[];
  empty: boolean;
}) => {
  const { color } = useIconTheme();
  const { chartWidth, chartHeight } = useChartDimensions();

  const hapticHit = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);
  };

  return (
    <LineChart.Provider
      data={statsData}
      yRange={empty ? { min: 0, max: 1000 } : undefined}
      onCurrentIndexChange={hapticHit}
    >
      <Flex gap={8}>
        <LineChart width={chartWidth} height={chartHeight}>
          <Flex gap={28}>
            <LineChart.Path color={color} />
            <LineChart.CursorLine color={color} />
            <LineChart.CursorCrosshair
              onActivated={hapticHit}
              onEnded={hapticHit}
              outerSize={18}
              size={12}
              color={color}
            />
          </Flex>
        </LineChart>
      </Flex>
    </LineChart.Provider>
  );
};

const StatsChartTimeLabels = ({
  setDuration,
  selectedDuration,
}: {
  setDuration: (duration: StatsDuration) => void;
  selectedDuration: number;
}) => {
  const { chartWidth, buttonWidth, labelWidth } = useChartDimensions();
  const previousIndex = useSharedValue(2);
  const currentIndex = useSharedValue(2);

  const sliderStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withSpring(buttonWidth * currentIndex.value + 20, {
            mass: 1,
            damping: 28,
            stiffness: 225,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
          }),
        },
      ],
    }),
    [buttonWidth]
  );

  return (
    <Flex row alignSelf="center" width={chartWidth}>
      <View style={StyleSheet.absoluteFill}>
        <AnimatedFlex
          bg="$backgroundPress"
          borderRadius={20}
          style={[StyleSheet.absoluteFillObject, sliderStyle]}
          width={labelWidth}
        />
      </View>
      {TIME_DURATIONS.map(([duration, label], index) => {
        const selected = duration === selectedDuration;
        return (
          <TouchableArea
            p={4}
            key={index}
            width={buttonWidth}
            onPress={() => {
              setDuration(duration);
              previousIndex.value = currentIndex.value;
              currentIndex.value = index;
            }}
          >
            <Text textAlign="center" color={selected ? "$color" : "$gray11"}>
              {label}
            </Text>
          </TouchableArea>
        );
      })}
    </Flex>
  );
};

const StatsDetailHeader = ({
  listeningStats,
}: {
  listeningStats?: ListeningStats;
}) => {
  const userMediaProgress = useAtomValue(mediaProgressAtom);

  const itemsFinshed = userMediaProgress?.filter((lip) => !!lip.isFinished);

  const daysListened = listeningStats?.days
    ? Object.values(listeningStats?.days).length
    : 0;

  const totalMinutesListening = listeningStats?.totalTime
    ? Math.round(listeningStats?.totalTime / 60)
    : 0;

  return (
    <Flex gap={12} mx={16}>
      <Text fontSize={20} fontWeight={"400"}>
        Your Stats
      </Text>
      <Flex row>
        <StatItem stat={itemsFinshed?.length ?? 0} label={"Items finshed"} />
        <StatItem stat={daysListened} label={"Days listened"} />
        <StatItem stat={totalMinutesListening} label={"Minutes listened"} />
      </Flex>
    </Flex>
  );
};

const StatItem = ({ stat, label }: { stat: number; label: string }) => {
  return (
    <Flex fill centered>
      <Text fontWeight={"700"} fontSize={32}>
        {stat}
      </Text>
      <Text color="$gray11" fontSize={12}>
        {label}
      </Text>
    </Flex>
  );
};

export default UserPage;
