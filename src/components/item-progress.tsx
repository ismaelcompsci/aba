import CircularProgress, {
  CircularProgressBase,
} from "react-native-circular-progress-indicator";
import {
  CircularProgressBaseProps,
  CircularProgressProps,
} from "react-native-circular-progress-indicator/lib/typescript/types";
import styles from "react-native-circular-progress-indicator/src/circularProgress/styles";
import { CheckCircle } from "@tamagui/lucide-icons";

import { useUserMediaProgress } from "../hooks/use-user-media-progress";

import { Flex } from "./layout/flex";

const ItemProgress = ({
  id,
  withText = true,
  showOnlyBase,
  checkMarkSize = 16,
  episodeId,
  ...rest
}: {
  id: string;
  withText?: boolean;
  showOnlyBase?: boolean;
  checkMarkSize?: number;
  episodeId?: string;
} & Omit<CircularProgressBaseProps & CircularProgressProps, "value">) => {
  const { userProgressPercent } = useUserMediaProgress({
    libraryItemId: id,
    episodeId,
  });

  if (userProgressPercent <= 0 || !userProgressPercent) {
    return null;
  }

  if (withText) {
    return (
      <CircularProgress
        value={userProgressPercent * 100}
        strokeColorConfig={[
          { color: rest.activeStrokeColor || "#2ecc71", value: 0 },
          { color: rest.activeStrokeColor || "#2ecc71", value: 99 },
          { color: "#2ecc71", value: 100 },
        ]}
        {...rest}
      />
    );
  } else
    return (
      // @ts-ignore
      <Flex style={[styles({ radius: rest?.radius }).container]}>
        {userProgressPercent < 1 ? (
          <CircularProgressBase
            value={userProgressPercent * 100}
            strokeColorConfig={[
              { color: rest.activeStrokeColor || "#2ecc71", value: 0 },
              { color: rest.activeStrokeColor || "#2ecc71", value: 99 },
              { color: "#2ecc71", value: 100 },
            ]}
            {...rest}
          />
        ) : showOnlyBase ? null : (
          <CheckCircle size={checkMarkSize} color="#2ecc71" />
        )}
      </Flex>
    );
};

export default ItemProgress;
