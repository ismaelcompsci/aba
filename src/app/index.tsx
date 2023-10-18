import { useEffect } from "react";
import * as Burnt from "burnt";
import { Redirect, router, useRootNavigationState } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Spinner } from "tamagui";

import { ScreenCenter } from "../components/center";
import {
  attemptingConnectionAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../state/app-state";
import {
  currentServerConfigAtom,
  deviceDataAtom,
  serverSettingsAtom,
} from "../state/local-state";
import { LoginServerResponse, ServerConfig } from "../types/types";
import { authenticateToken, pingServer } from "../utils/api";
import { stringToBase64 } from "../utils/utils";

export default function IndexPage() {
  const rootNavigationState = useRootNavigationState();

  const [user, setUser] = useAtom(userAtom);
  const attemptingConnection = useAtomValue(attemptingConnectionAtom);
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setCurrentServerConfig = useSetAtom(currentServerConfigAtom);

  const makeConnection = async ({
    user,
    userDefaultLibraryId,
    serverSettings,
    address,
    id,
  }: LoginServerResponse & { address: string; id?: string }) => {
    if (!user) return;

    setCurrentLibraryId(userDefaultLibraryId);
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

    router.push("/library/");
  };

  const connectToServer = async (config: ServerConfig) => {
    try {
      const pinged = await pingServer(config.serverAddress);
      if (!pinged.success) {
        Burnt.toast({
          title: "Server ping failed",
        });
        return;
      }

      const response = await authenticateToken(config);
      if (!response) {
        Burnt.toast({
          title: "Token has expired",
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

    // prettyLog(sc);
    return sc;
  };

  useEffect(() => {
    if (!user && !attemptingConnection) {
      router.push("/server-connect/");
    }
  }, [user, attemptingConnection]);

  useEffect(() => {
    if (!deviceData.lastServerConnectionConfigId) return;

    const config = deviceData.serverConnectionConfigs.find(
      (s) => s.id == deviceData.lastServerConnectionConfigId
    );

    if (!config) return;
    connectToServer(config);
  }, []);

  if (!rootNavigationState?.key) return null;

  return (
    <>
      {attemptingConnection ? (
        <ScreenCenter>
          <Spinner />
        </ScreenCenter>
      ) : (
        <ScreenCenter>
          <Redirect href={"/library/"} />
        </ScreenCenter>
      )}
    </>
  );
}
