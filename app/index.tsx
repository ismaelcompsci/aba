import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Card,
  Input,
  Label,
  Spinner,
  Stack,
  Text,
  YStack,
} from "tamagui";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useToastController } from "@tamagui/toast";
import { Toast } from "../components/toast";
import { LoginServerResponse } from "../types/server";
import settings from "../store/settings";
import { GeneralSetting } from "../types/types";
import { useRouter } from "expo-router";
import LoginForm, { ServerConfig } from "../components/login/login-form";

// const loginSchema = z.object({
//   serverAddress: z
//     .string()
//     .trim()
//     .min(1, { message: "Server Address is required" }),
//   username: z.string().min(1, { message: "username required" }),
//   password: z.string().min(1, { message: "password required" }),
// });

// type LoginSchema = z.infer<typeof loginSchema>;

// export type ServerConfig = LoginSchema & {
//   userId?: string;
//   token?: string;
//   id?: string;
// };

const IndexPage = () => {
  const router = useRouter();
  const [deviceServerConfigs, setDeviceServerConfigs] =
    useState<ServerConfig[]>();
  // const [loading, setLoading] = useState(false);
  const [serverConfig, setServerConfig] = useState<ServerConfig>();
  const toast = useToastController();

  // const {
  //   handleSubmit,
  //   control,
  //   setError,
  //   clearErrors,
  //   formState: { errors },
  // } = useForm({
  //   resolver: zodResolver(loginSchema),
  //   defaultValues: {
  //     serverAddress: "http://192.168.1.160:54932",
  //     username: "owner_ismael",
  //     password: "olvera608",
  //   },
  // });

  // const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
  //   try {
  //     setLoading(true);
  //     console.log("Dat", data);
  //     setServerConfig(data);
  //     const success = await pingServer(data.serverAddress);

  //     if (!success) {
  //       toast.show("Error", {
  //         message: "Falied to ping server",
  //       });
  //     }

  //     const payload = await requestServerLogin(data);
  //     if (payload) {
  //       makeConnection(payload);
  //     }
  //   } catch (error) {
  //     console.error("[ONSUBMIT_INDEX] ", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const makeConnection = (
    { user, userDefaultLibraryId, serverSettings }: LoginServerResponse,
    config?: ServerConfig
  ) => {
    if (!user) return;

    settings.saveServerSetting(GeneralSetting.ServerSettings, serverSettings);
    console.log(serverConfig?.username, config?.username);
    if (serverConfig || config) {
      const c = serverConfig ? serverConfig : config;
      if (!c) return;

      c.userId = user.id;
      c.token = user.token;

      settings.saveServerSetting(
        GeneralSetting.CurrentLibrary,
        userDefaultLibraryId
      );
      settings.setCurrentServerConfig(c);

      console.log("Successfully logged in", user.username);
      router.push("/home");
    }
  };

  const connectToServer = async (config: ServerConfig) => {
    const success = pingServer(config.serverAddress);
    if (!success) {
      return;
    }
    const payload = await authenticateToken(config);

    if (payload) {
      makeConnection(payload as any as LoginServerResponse, config);
    }

    // setError("root.unknownError", {
    //   message: "Unknown Error",
    // });
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

        // setError("root.unknownError", {
        //   message: errorMsg as string,
        // });
        return null;
      });

    return authResponse?.data;
  };

  // const requestServerLogin = async (config: LoginSchema) => {
  //   const options = {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };

  //   return axios
  //     .post(
  //       `${config?.serverAddress}/login`,
  //       {
  //         username: config?.username,
  //         password: config?.password,
  //       },
  //       options
  //     )
  //     .then((data) => {
  //       if (!data.data.user) {
  //         console.error(data.data.error || "Unkown Error");
  //         setError("root.unknownError", {
  //           message: "Failed to login",
  //         });
  //         return false;
  //       }
  //       clearErrors("root.unknownError");
  //       return data.data;
  //     })
  //     .catch((error: AxiosError) => {
  //       var errorMsg = error.response
  //         ? error.response.data || "Unknown Error"
  //         : "Unknown Error";

  //       setError("root.unknownError", {
  //         message: errorMsg as string,
  //       });
  //       return false;
  //     });
  // };

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
        return false;
      });
  };

  useEffect(() => {
    const deviceData = settings.getDeviceData();
    if (deviceData.lastServerConnectionConfigId) {
      setDeviceServerConfigs(deviceData.serverConnectionConfigs);
      const config = deviceData.serverConnectionConfigs.find(
        (s) => s.userId == deviceData.lastServerConnectionConfigId
      );
      if (!config) return;

      console.log("[AUTH] login in with token for user ", config);

      // connectToServer(config);
    }
  }, []);

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
                {deviceServerConfigs ? (
                  <YStack>
                    {deviceServerConfigs.map((config) => (
                      <Text key={config.id}>{config.serverAddress}</Text>
                    ))}
                  </YStack>
                ) : (
                  <>
                    <LoginForm
                      makeConnection={makeConnection}
                      pingServer={pingServer}
                    />
                    {/* <Controller
                      control={control}
                      name="serverAddress"
                      render={({ field, fieldState }) => (
                        <Stack space={"$space.1.5"}>
                          <Label htmlFor="serverAddress">Server Address</Label>
                          <Input
                            placeholder="http://555.555.5.555:5555"
                            onBlur={field.onBlur}
                            value={field.value}
                            disabled={loading}
                            onChangeText={field.onChange}
                          />
                          {!!fieldState.error?.message && (
                            <ErrorMessage message={fieldState.error?.message} />
                          )}
                        </Stack>
                      )}
                    />
                    <Controller
                      control={control}
                      name="username"
                      render={({ field, fieldState }) => (
                        <Stack space={"$space.1.5"}>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            placeholder="root"
                            onBlur={field.onBlur}
                            value={field.value}
                            disabled={loading}
                            onChangeText={field.onChange}
                          />
                          {!!fieldState.error?.message && (
                            <ErrorMessage message={fieldState.error?.message} />
                          )}
                        </Stack>
                      )}
                    />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <Stack space={"$space.1.5"}>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            placeholder="password"
                            onBlur={field.onBlur}
                            textContentType="password"
                            secureTextEntry
                            disabled={loading}
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                          {!!fieldState.error?.message && (
                            <ErrorMessage message={fieldState.error?.message} />
                          )}
                        </Stack>
                      )}
                    />
                    {errors?.root?.unknownError && (
                      <ErrorMessage
                        message={errors?.root?.unknownError?.message!}
                      />
                    )}
                    <Button
                      onPress={handleSubmit(onSubmit)}
                      iconAfter={
                        loading ? (
                          <Spinner size="small" color={"$blue10"} />
                        ) : null
                      }
                      backgroundColor={loading ? "$color5" : "$background"}
                      disabled={loading}
                    >
                      {loading ? (
                        <Text color={"$color9"}>Connecting</Text>
                      ) : (
                        <Text color={"$color12"}>Connect</Text>
                      )}
                    </Button> */}
                  </>
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
