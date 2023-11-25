import { useWindowDimensions } from "react-native";

const useChartDimensions = () => {
  const { width, height } = useWindowDimensions();

  const chartHeight = height * 0.35;
  const chartWidth = width;

  const buttonWidth = chartWidth / 5;
  const labelWidth = buttonWidth - 20 * 2;

  return {
    chartHeight,
    chartWidth,
    buttonWidth,
    labelWidth,
  };
};

export default useChartDimensions;
