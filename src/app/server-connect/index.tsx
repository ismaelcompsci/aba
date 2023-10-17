import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Button, Card, Text, YStack } from "tamagui";

import { ClearIconButton, IconButton } from "../../components/button/button";
import { ScreenCenter } from "../../components/center";
import AddServerForm from "../../components/connection-form/add-server-form";
import { deviceDataAtom } from "../../state/local-state";

const ServerConnectPage = () => {
  const [showAddServerForm, setShowAddServerForm] = useState(false);
  const [deviceData, setDeviceData] = useAtom(deviceDataAtom);

  const serverConnections = deviceData.serverConnectionConfigs;

  useEffect(() => {
    if (!serverConnections.length) {
      setShowAddServerForm(true);
    }
  }, [deviceData]);

  return (
    <ScreenCenter>
      <KeyboardAvoidingView
        keyboardVerticalOffset={64}
        style={{ width: "100%", paddingHorizontal: "10%" }}
        behavior={Platform.OS === "ios" ? "position" : "height"}
      >
        <Card width="100%" bordered space="$4" p="$2">
          {showAddServerForm ? (
            <AddServerForm setShowAddServerForm={setShowAddServerForm} />
          ) : serverConnections.length ? (
            serverConnections.map((server) => (
              <Button key={server.id}>{server.name}</Button>
            ))
          ) : (
            <YStack>
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
