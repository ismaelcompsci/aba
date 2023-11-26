import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";

import { serverAddressAtom, userTokenAtom } from "../state/app-state";
import { ListeningStats } from "../types/types";

function getPastDates(days: number) {
  const dates = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

function padMissingDates(
  days: { [key: string]: number },
  duration: StatsDuration,
  pastDaysNumber: number
) {
  const data: { timestamp: number; value: number }[] = [];

  const pastDays = getPastDates(pastDaysNumber);
  const pastDaysListenedDates: { value: number; timestamp: Date }[] = [];

  for (const [key, value] of Object.entries(days)) {
    const listeningDate = new Date(key);
    const now = new Date();
    const timeDifference = now.getTime() - listeningDate.getTime();

    if (timeDifference <= duration) {
      pastDaysListenedDates.push({
        value: Math.floor(value),
        timestamp: listeningDate,
      });
    }
  }

  for (let i = 0; i < pastDays.length; i++) {
    const dayOfWeek = pastDays[i];
    const correspondingListenedDate = pastDaysListenedDates.find(
      (date) =>
        date.timestamp.toLocaleDateString() === dayOfWeek.toLocaleDateString()
    );

    if (correspondingListenedDate) {
      data.push({
        timestamp: dayOfWeek.getTime(),
        value: correspondingListenedDate.value,
      });
    } else {
      data.push({
        timestamp: dayOfWeek.getTime(),
        value: 0,
      });
    }
  }

  data.sort((a, b) => {
    if (a.timestamp < b.timestamp) {
      return -1;
    } else if (a.timestamp > b.timestamp) return 1;

    return 0;
  });

  return data;
}

export enum StatsDuration {
  // Hour = 60 * 60 * 1000,
  // Day = 24 * 60 * 60 * 1000,
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
    let data: { timestamp: number; value: number }[] = [];
    if (isLoading) return [];
    if (userStats) {
      if (duration === StatsDuration.Week) {
        data = padMissingDates(userStats.days, duration, 7);
      } else if (duration === StatsDuration.Month) {
        data = padMissingDates(userStats.days, duration, 30);
      } else {
        for (const [key, value] of Object.entries(userStats.days)) {
          const listeningDate = new Date(key);
          const now = new Date();
          const timeDifference = now.getTime() - listeningDate.getTime();

          if (timeDifference <= duration) {
            data.push({
              value: Math.floor(value),
              timestamp: listeningDate.getTime(),
            });
            setEmpty(false);
          }

          if (data.length === 1) {
            setEmpty(true);
            data.unshift({ timestamp: data[0].timestamp - 100, value: 0 });
          }
          if (!data.length) {
            setEmpty(true);
            data.push({ timestamp: new Date().getTime(), value: 0 });
            data.push({ timestamp: new Date().getTime(), value: 0 });
          }

          data.sort((a, b) => {
            if (a.timestamp < b.timestamp) {
              return -1;
            } else if (a.timestamp > b.timestamp) return 1;

            return 0;
          });
        }
      }
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
