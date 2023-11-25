import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";

import { serverAddressAtom, userTokenAtom } from "../state/app-state";
import { ListeningStats } from "../types/types";

export enum StatsDuration {
  Hour = 60 * 60 * 1000,
  Day = 24 * 60 * 60 * 1000,
  Week = 7 * 24 * 60 * 60 * 1000,
  Month = 31 * 24 * 60 * 60 * 1000,
  Year = 365 * 24 * 60 * 60 * 1000,
}

export const useUserStats = () => {
  const [duration, setDuration] = useState<StatsDuration>(StatsDuration.Week);
  const [empty, setEmpty] = useState(false);
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);

  const {
    data: userStats,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await axios.get(
        `${serverAddress}/api/me/listening-stats`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return response.data as ListeningStats;
    },
  });

  const data = useMemo(() => {
    const data: { timestamp: number; value: number }[] = [];

    if (userStats?.days) {
      for (const [key, value] of Object.entries(userStats.days)) {
        const listeningDate = new Date(key);
        const now = new Date();
        const timeDifference = now.getTime() - listeningDate.getTime();

        if (timeDifference < duration) {
          data.push({
            value,
            timestamp: listeningDate.getTime(),
          });
          setEmpty(false);
        }
      }
    }

    if (!data.length) {
      setEmpty(true);
      data.push({ timestamp: new Date().getTime(), value: 0 });
      data.push({ timestamp: new Date().getTime(), value: 0 });
    }

    return data;
  }, [duration, isSuccess, userStats]);

  return useMemo(() => {
    return {
      statsData: {
        chartData: data,
        allStats: userStats,
      },
      loading: isLoading,
      error,
      selectedDuration: duration,
      setDuration,
      empty,
    };
  }, [duration, data, userStats, empty]);
};
