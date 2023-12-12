import { useEffect, useState } from "react";
import * as Burnt from "burnt";
import { Redirect, router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Spinner } from "tamagui";

import { Screen } from "../components/layout/screen";
import { useAppSafeAreas } from "../hooks/use-app-safe-areas";
import {
  attemptingConnectionAtom,
  currentLibraryIdAtom,
  mediaProgressAtom,
  userAtom,
} from "../state/app-state";
import {
  currentServerConfigAtom,
  deviceDataAtom,
  lastLibraryIdAtom,
  serverSettingsAtom,
} from "../state/local-state";
import { LoginServerResponse, ServerConfig } from "../types/types";
import { authenticateToken, pingServer } from "../utils/api";
import { stringToBase64 } from "../utils/utils";

export default function IndexPage() {
  // const [isMounted, setIsMounted] = useState(false);

  const setUser = useSetAtom(userAtom);
  const [attemptingConnection, setAttemptingConnection] = useAtom(
    attemptingConnectionAtom
  );
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setCurrentServerConfig = useSetAtom(currentServerConfigAtom);
  const setMediaProgress = useSetAtom(mediaProgressAtom);
  const lastLibraryId = useAtomValue(lastLibraryIdAtom);

  const { headerHeight } = useAppSafeAreas();

  const makeConnection = async ({
    user,
    userDefaultLibraryId,
    serverSettings,
    address,
    id,
  }: LoginServerResponse & { address: string; id?: string }) => {
    if (!user) return;

    if (
      lastLibraryId &&
      (!user.librariesAccessible.length ||
        user.librariesAccessible.includes(lastLibraryId))
    ) {
      setCurrentLibraryId(lastLibraryId);
    } else setCurrentLibraryId(userDefaultLibraryId);

    setMediaProgress(user.mediaProgress);
    setServerSettings(serverSettings);
    setUser(user);

    const c = {
      userId: user.id,
      token: user.token,
      username: user.username,
      serverAddress: address,
      id: id,
    };

    const serverConfig = saveServerConfig(c);

    if (!serverConfig) {
      console.log("NO SERVER CONFIG");
      return;
    }

    setCurrentServerConfig(serverConfig);
    console.info("Successfully logged in", user.username);

    setAttemptingConnection(false);
    router.push("/library/");
  };

  const connectToServer = async (config: ServerConfig) => {
    try {
      const pinged = await pingServer(config.serverAddress);
      if (!pinged.success) {
        Burnt.toast({
          title: "Server ping failed",
          preset: "error",
        });
        setAttemptingConnection(false);
        return;
      }

      const response = await authenticateToken(config);
      if (!response) {
        Burnt.toast({
          title: "Token has expired",
          preset: "error",
        });
        return;
      }
      response.address = config.serverAddress;
      response.id = config.id;

      await makeConnection(response);
    } catch (error) {
      console.error(error);
    }
  };

  const saveServerConfig = (serverConfig: {
    userId: string;
    token: string;
    username: string;
    serverAddress: string;
    id?: string;
  }) => {
    let sc = deviceData.serverConnectionConfigs.find(
      (c) => c.id === serverConfig.id
    );

    const duplicateConfig = deviceData.serverConnectionConfigs.find(
      (s) =>
        s.serverAddress === serverConfig.serverAddress &&
        s.username === serverConfig.username &&
        serverConfig.id !== s.id
    );

    if (duplicateConfig) {
      Burnt.toast({
        title: "Duplicate login",
        message: "username and address already exist",
        preset: "error",
      });

      return;
    }

    if (sc) {
      sc.userId = serverConfig.userId;
      sc.name = `${serverConfig.serverAddress} (${serverConfig.username})`;
      sc.token = serverConfig.token;
      sc.serverAddress = serverConfig.serverAddress;
      sc.username = serverConfig.username;

      const deduped = deviceData.serverConnectionConfigs.filter(
        (config) => config.id !== sc!.id
      );
      setDeviceData({
        serverConnectionConfigs: [...deduped, sc],
        lastServerConnectionConfigId: sc.id,
      });
    } else {
      const addr = serverConfig.serverAddress;
      const uname = serverConfig.username;
      sc = {
        id: stringToBase64(`${addr}::${uname}`),
        index: deviceData.serverConnectionConfigs.length,
        name: `${serverConfig.serverAddress} (${serverConfig.username})`,
        userId: serverConfig.userId,
        username: serverConfig.username,
        serverAddress: serverConfig.serverAddress,
        token: serverConfig.token,
      };

      setDeviceData({
        serverConnectionConfigs: [...deviceData.serverConnectionConfigs, sc],
        lastServerConnectionConfigId: sc.id || "",
      });
    }

    return sc;
  };

  useEffect(() => {
    // setIsMounted(true);
    if (!deviceData.lastServerConnectionConfigId) {
      setAttemptingConnection(false);
      return;
    }

    const config = deviceData.serverConnectionConfigs.find(
      (s) => s.id == deviceData.lastServerConnectionConfigId
    );

    if (!config) return;

    connectToServer(config);
  }, []);

  // useEffect(() => {
  //   if (
  //     (!user && isMounted && !attemptingConnection) ||
  //     (isMounted &&
  //       !deviceData.lastServerConnectionConfigId &&
  //       !deviceData.serverConnectionConfigs.length)
  //   ) {
  //     router.replace("/server-connect/");
  //   }
  // }, [user, isMounted, attemptingConnection, deviceData]);

  return (
    <Screen centered pb={headerHeight}>
      <Connector />
      {attemptingConnection ? <Spinner /> : <Redirect href={"/library/"} />}
    </Screen>
  );
}

const Connector = () => {
  const [isMounted, setIsMounted] = useState(false);

  const [user] = useAtom(userAtom);
  const [attemptingConnection] = useAtom(attemptingConnectionAtom);
  const [deviceData] = useAtom(deviceDataAtom);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (
      (!user && isMounted && !attemptingConnection) ||
      (isMounted &&
        !deviceData.lastServerConnectionConfigId &&
        !deviceData.serverConnectionConfigs.length)
    ) {
      router.replace("/server-connect/");
    }
  }, [user, isMounted, attemptingConnection, deviceData]);

  return null;
};
