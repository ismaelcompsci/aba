import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { MoreVertical } from "@tamagui/lucide-icons";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { Button, Card, Spinner, Text, YStack } from "tamagui";

import { ClearIconButton } from "../../components/buttons/button";
import { ScreenCenter } from "../../components/center";
import AddServerForm from "../../components/connection-form/add-server-form";
import { currentLibraryIdAtom, userAtom } from "../../state/app-state";
import {
  currentServerConfigAtom,
  deviceDataAtom,
  serverSettingsAtom,
} from "../../state/local-state";
import { LoginServerResponse, ServerConfig } from "../../types/types";
import { authenticateToken, pingServer } from "../../utils/api";
import { stringToBase64 } from "../../utils/utils";
import ServerConfigMenu from "../../components/menus/server-config-menu";

const ServerConnectPage = () => {
  const [loading, setLoading] = useState(false);
  const [pressedServer, setPressedServer] = useState<ServerConfig | null>(null);

  const [showAddServerForm, setShowAddServerForm] = useState(false);

  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);
  const setCurrentLibraryId = useSetAtom(currentLibraryIdAtom);
  const setServerSettings = useSetAtom(serverSettingsAtom);
  const setCurrentServerConfig = useSetAtom(currentServerConfigAtom);

  const setUser = useSetAtom(userAtom);

  const serverConnections = deviceData.serverConnectionConfigs;

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

  const saveServerConfig = (serverConfig: {
    userId: string;
    token: string;
    username: string;
    serverAddress: string;
    id?: string;
  }) => {
    let sc = serverConnections.find((c) => c.id === serverConfig.id);

    const duplicateConfig = deviceData.serverConnectionConfigs.find(
      (s) =>
        s.serverAddress === serverConfig.serverAddress &&
        s.username === serverConfig.username &&
        serverConfig.id !== s.id
    );

    if (duplicateConfig) {
      // TODO
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

      const deduped = serverConnections.filter(
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

  const connectToServer = async (config: ServerConfig) => {
    try {
      setLoading(true);
      const pinged = await pingServer(config.serverAddress);
      if (!pinged.success) {
        Burnt.toast({
          title: "Server ping failed",
          preset: "error",
        });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serverConnections?.length <= 0) {
      setShowAddServerForm(true);
    }
  }, [deviceData.serverConnectionConfigs]);

  return (
    <ScreenCenter>
      <KeyboardAvoidingView
        keyboardVerticalOffset={64}
        style={{ width: "100%", paddingHorizontal: "10%" }}
        behavior={Platform.OS === "ios" ? "position" : "height"}
      >
        <Card width="100%" bordered space="$4" p="$2">
          {showAddServerForm ? (
            <AddServerForm
              serverConnections={serverConnections}
              makeConnection={makeConnection}
              setShowAddServerForm={setShowAddServerForm}
            />
          ) : serverConnections?.length ? (
            serverConnections.map((server) => (
              <Button
                key={server.id}
                disabled={loading}
                onPress={() => {
                  setPressedServer(server);
                  connectToServer(server);
                }}
              >
                {server.name}
                {pressedServer?.id === server.id && loading ? (
                  <Spinner />
                ) : null}
                <ServerConfigMenu config={server} />
              </Button>
            ))
          ) : (
            <YStack w={"100%"} alignItems="center" justifyContent="center">
              <Text>Empty :/</Text>
            </YStack>
          )}

          <Card.Footer>
            {!showAddServerForm && (
              <Button w={"100%"} onPress={() => setShowAddServerForm(true)}>
                Add new server
              </Button>
            )}
          </Card.Footer>
        </Card>
      </KeyboardAvoidingView>
    </ScreenCenter>
  );
};

export default ServerConnectPage;
