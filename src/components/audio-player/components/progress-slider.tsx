import { Slider, SliderTrackProps, styled, XStack } from "tamagui";

export const ProgressSlider = ({
  overallCurrentTime,
  totalDuration,
  color,
  trackProps,
  showThumb,
}: {
  overallCurrentTime: number;
  totalDuration: number;
  color: string;
  trackProps?: SliderTrackProps;
  showThumb: boolean;
}) => {
  return (
    <ProgressContainer>
      {!!overallCurrentTime && !!totalDuration ? (
        <Slider
          flex={1}
          min={0}
          defaultValue={[overallCurrentTime ? overallCurrentTime : 0]}
          max={totalDuration ? Math.floor(totalDuration) : 100}
          step={1}
          size={"$2"}
          disabled={!showThumb}
        >
          <Slider.Track {...trackProps}>
            <Slider.TrackActive bg={color} />
          </Slider.Track>
          {showThumb ? (
            <Slider.Thumb size="$2" index={0} circular elevate />
          ) : null}
        </Slider>
      ) : (
        <PlaceHolderSlider />
      )}
    </ProgressContainer>
  );
};

const ProgressContainer = styled(XStack, {
  // flex: 1,
  gap: "$1",
  alignItems: "center",
  justifyContent: "space-between",
  mt: 4,
});

const PlaceHolderSlider = () => {
  return (
    <Slider flex={1} defaultValue={[0]} max={100} step={1}>
      <Slider.Track>
        <Slider.TrackActive />
      </Slider.Track>
      <Slider.Thumb size="$1" index={0} circular elevate />
    </Slider>
  );
};
