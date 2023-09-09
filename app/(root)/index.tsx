import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Stack, Text, YStack } from "tamagui";

import { useToastController } from "@tamagui/toast";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import LoginForm, { ServerConfig } from "../../components/login/login-form";
import { Toast } from "../../components/toast";
import { LoginServerResponse } from "../../types/server";
import { useAtom, useSetAtom } from "jotai/react";
import {
  currentLibraryAtom,
  currentServerConfigAtom,
  currentUserAtom,
  deviceDataAtom,
  serverSettingsAtom,
} from "../../utils/local-atoms";

global.Buffer = require("buffer").Buffer;

const IndexPage = () => {
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setCurrentLibrary = useSetAtom(currentLibraryAtom);
  const setCurrentServerConfig = useSetAtom(currentServerConfigAtom);

  const [showAddServer, setShowAddServer] = useState(false);
  const toast = useToastController();
  const router = useRouter();

  const deviceServerConfigs = deviceData.serverConnectionConfigs;

  const makeConnection = (
    { user, userDefaultLibraryId, serverSettings }: LoginServerResponse,
    config?: ServerConfig
  ) => {
    if (!user) return;

    if (config) {
      const c = config;
      if (!c) return;

      c.userId = user.id;
      c.token = user.token;

      setCurrentLibrary(userDefaultLibraryId);
      setServerSettings(serverSettings);
      setCurrentUser(user);
      const ssc = saveServerConfig(c);
      setCurrentServerConfig(ssc);

      console.log("Successfully logged in", user.username);
      router.push("/home/");
    }
  };

  const connectToServer = async (config: ServerConfig) => {
    const success = pingServer(config.serverAddress);
    if (!success) {
      return;
    }
    const payload = await authenticateToken(config);

    if (!payload) {
      toast.show("Unknown Error");
      return;
    }

    makeConnection(payload as any as LoginServerResponse, config);
  };

  const authenticateToken = async (config: ServerConfig) => {
    const authResponse = await axios
      .post(`${config.serverAddress}/api/authorize`, null, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      })
      .catch((error) => {
        console.error("[SERVER] server auth failed", error);
        var errorMsg = error.response
          ? error.response.data || "Unknown Error"
          : "Unknown Error";

        console.error("[AUTH_TOKEN] ", errorMsg);

        // setError("root.unknownError", {
        //   message: errorMsg as string,
        // });
        toast.show("Unknown Error");
        return null;
      });

    return authResponse?.data;
  };

  const pingServer = async (addr: string) => {
    const options = { timeout: 3000 };

    return axios
      .get(`${addr}/ping`, options)
      .then((data) => {
        console.log("[PING_SERVER]", data.data.success ? "success" : "error");
        return data.data.success;
      })
      .catch((error) => {
        console.error("Server check failed", error);
        // setError("serverAddress", { message: "Failed to ping server" });
        toast.show("Error", {
          message: "Failed to ping server",
        });
        return false;
      });
  };

  useEffect(() => {
    if (!deviceData) return;
    if (deviceData.lastServerConnectionConfigId) {
      const config = deviceData.serverConnectionConfigs.find(
        (s) => s.userId == deviceData.lastServerConnectionConfigId
      );
      if (!config) return;
      console.log("[AUTH] login in with token for user ", config.username);
      connectToServer(config);
    }
  }, []);

  const saveServerConfig = (serverConfig: ServerConfig) => {
    console.log(deviceData);
    var sc = deviceData?.serverConnectionConfigs?.find(
      (s) => s.id == serverConfig.id
    );

    const duplicateConfig = deviceData.serverConnectionConfigs.find(
      (s) =>
        s.serverAddress === serverConfig.serverAddress &&
        s.username === serverConfig.username &&
        serverConfig.id !== s.id
    );

    if (duplicateConfig) {
      toast.show("Duplicate account", {
        message: "username and address already exist",
      });
      return;
    }
    if (sc) {
      // sc.password = serverConfig.password;
      console.log("NOT NEW NOT ADDING");
      sc.name = `${sc.serverAddress} (${serverConfig.username})`;
      sc.userId = serverConfig.userId;
      sc.name = serverConfig.name;
      sc.token = serverConfig.token;
      sc.serverAddress = serverConfig.serverAddress;
      sc.username = serverConfig.username;

      const filterd = deviceData.serverConnectionConfigs.filter(
        (config) => config.id !== sc?.id
      );

      setDeviceData({
        serverConnectionConfigs: [...filterd, sc],
        lastServerConnectionConfigId: sc.id || "",
      });
    } else {
      sc = {
        id: Buffer.from(
          `${serverConfig.serverAddress}::${serverConfig.username}`
        ).toString("base64"),
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

  return (
    <>
      <Toast />
      <YStack>
        <Stack
          bg={"$background"}
          height={"100%"}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <KeyboardAvoidingView
            keyboardVerticalOffset={64}
            style={{ width: "100%" }}
            behavior={Platform.OS === "ios" ? "position" : "height"}
          >
            <Stack px={"$4"}>
              <Card bordered w={"100%"} space={"$4"} padded>
                {!showAddServer ? (
                  <YStack space="$2">
                    {deviceServerConfigs?.map((config) => (
                      <Button
                        onPress={() => connectToServer(config)}
                        key={`${config.id}${config.index}`}
                      >
                        <Text>{config.serverAddress}</Text>
                      </Button>
                    ))}
                  </YStack>
                ) : (
                  <>
                    <LoginForm
                      toastShow={toast.show}
                      makeConnection={makeConnection}
                      pingServer={pingServer}
                    />
                  </>
                )}
                {!showAddServer && (
                  <Button onPress={() => setShowAddServer(true)}>
                    <Text>Add new server</Text>
                  </Button>
                )}
              </Card>
            </Stack>
          </KeyboardAvoidingView>
        </Stack>
      </YStack>
    </>
  );
};
export default IndexPage;
