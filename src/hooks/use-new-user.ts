import { useEffect, useState } from "react";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";

import { userAtom } from "../state/app-state";
import { currentServerConfigAtom } from "../state/local-state";
import { User } from "../types/aba";

export const useNewUser = (skipAutoRefresh?: boolean) => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const [user, setUser] = useAtom(userAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (skipAutoRefresh) return;
    (async () => {
      await refreshUser();
    })();
  }, []);

  const getUpdatedUser = async () => {
    try {
      console.log("UPDATING USER");
      const response = await axios.get(`${serverConfig.serverAddress}/api/me`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      return response.data as User;
    } catch (error) {
      console.log("[APPDIALOG] getUpdatedUser error", error);
      return;
    }
  };

  const refreshUser = async () => {
    setReady(true);
    const newUser = await getUpdatedUser();
    if (newUser) {
      setUser(newUser);
    }
  };

  return {
    user,
    refreshUser,
    ready,
    setReady,
  };
};
