import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Spinner, Stack, Text, YStack } from "tamagui";

import { useToastController } from "@tamagui/toast";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai/react";
import { KeyboardAvoidingView, Platform } from "react-native";
import LoginForm, { ServerConfig } from "../../components/login/login-form";
import { Toast } from "../../components/toast";
import { LoginServerResponse } from "../../types/server";
import {
  currentLibraryAtom,
  currentServerConfigAtom,
  currentUserAtom,
  deviceDataAtom,
  serverSettingsAtom,
} from "../../utils/local-atoms";
import { IconButton } from "../../components/ui/button";
import { ChevronLeft } from "@tamagui/lucide-icons";

global.Buffer = require("buffer").Buffer;

const IndexPage = () => {
  const [load, setLoad] = useState(false);
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setCurrentLibrary = useSetAtom(currentLibraryAtom);
  const [currentServerConfig, setCurrentServerConfig] = useAtom(
    currentServerConfigAtom
  );

  const [showAddServer, setShowAddServer] = useState(false);
  const toast = useToastController();
  const router = useRouter();

  const deviceServerConfigs = deviceData.serverConnectionConfigs;

  const makeConnection = (
    { user, userDefaultLibraryId, serverSettings }: LoginServerResponse,
    config: ServerConfig
  ) => {
    if (!user || !config) return;

    config.userId = user.id;
    config.token = user.token;

    setCurrentLibrary(userDefaultLibraryId);
    setServerSettings(serverSettings);
    setCurrentUser(user);
    const ssc = saveServerConfig(config);
    setCurrentServerConfig(ssc);

    console.log("Successfully logged in", user.username);
    setLoad(false);
    router.push("/home/");
  };

  const connectToServer = async (config: ServerConfig) => {
    const success = await pingServer(config.serverAddress);

    if (!success) {
      setLoad(false);
      clearLastServerConnectionConfig();
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
        toast.show("Error", {
          message: "Failed to ping server",
        });
        return false;
      });
  };

  useEffect(() => {
    if (!deviceData.lastServerConnectionConfigId) return;

    const config = deviceData.serverConnectionConfigs.find(
      (s) => s.id == deviceData.lastServerConnectionConfigId
    );

    if (!config) return;
    setLoad(true);

    connectToServer(config);
  }, []);

  const clearLastServerConnectionConfig = () => {
    const newData = deviceData;
    newData.lastServerConnectionConfigId = "";

    setDeviceData(newData);
  };

  const saveServerConfig = (serverConfig: ServerConfig) => {
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
            {load ? (
              <Spinner />
            ) : (
              <Stack px={"$4"}>
                <Card bordered w={"100%"} space={"$4"} padded>
                  {showAddServer && (
                    <IconButton
                      onPress={() => setShowAddServer(false)}
                      w={"$4"}
                      icon={<ChevronLeft size={"$1"} color={"$blue10Dark"} />}
                    />
                  )}
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
            )}
          </KeyboardAvoidingView>
        </Stack>
      </YStack>
    </>
  );
};
export default IndexPage;
