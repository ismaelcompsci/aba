import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Input, Label, Spinner, Stack, Text, View } from "tamagui";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoginServerResponse } from "../../types/server";

const loginSchema = z.object({
  serverAddress: z
    .string()
    .trim()
    .min(1, { message: "Server Address is required" }),
  username: z.string().min(1, { message: "username required" }),
  password: z.string().min(1, { message: "password required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type ServerConfig = {
  serverAddress: string;
  username: string;
  userId: string;
  token: string;
  index: number;
  name: string;
  id: string;
};

interface LoginFormProps {
  makeConnection: (values: LoginServerResponse, config: ServerConfig) => void;
  pingServer: (serverAddr: string) => any;
  toastShow: (title: string, options: any) => void;
}

const LoginForm = ({
  makeConnection,
  pingServer,
  toastShow,
}: LoginFormProps) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      serverAddress: "http://192.168.1.160:54932", // TODO REMOVE
      username: "owner_ismael", // TODO REMOVE
      password: "olvera608", // TODO REMOVE
    },
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      setLoading(true);
      const success = await pingServer(data.serverAddress);
      if (!success) {
        toastShow("Error", {
          message: "Falied to ping server",
        });
        setLoading(false);
        return;
      }

      const payload = await requestServerLogin(data);
      if (payload) {
        // @ts-ignore TODO fix
        makeConnection(payload, data);
      }
    } catch (error) {
      console.error("[ONSUBMIT_INDEX] ", error);
    } finally {
      setLoading(false);
    }
  };

  const requestServerLogin = async (config: LoginSchema) => {
    const options = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    return axios
      .post(
        `${config?.serverAddress}/login`,
        {
          username: config?.username,
          password: config?.password,
        },
        options
      )
      .then((data) => {
        if (!data.data.user) {
          console.error(data.data.error || "Unkown Error");
          setError("root.unknownError", {
            message: "Failed to login",
          });
          return false;
        }
        clearErrors("root.unknownError");
        return data.data;
      })
      .catch((error: AxiosError) => {
        var errorMsg = error.response
          ? error.response.data || "Unknown Error"
          : "Unknown Error";

        setError("root.unknownError", {
          message: errorMsg as string,
        });
        return false;
      });
  };

  return (
    <View space={"$4"}>
      <Controller
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
        <ErrorMessage message={errors?.root?.unknownError?.message!} />
      )}
      <Button
        onPress={handleSubmit(onSubmit)}
        iconAfter={loading ? <Spinner size="small" color={"$blue10"} /> : null}
        backgroundColor={loading ? "$color5" : "$background"}
        disabled={loading}
      >
        {loading ? (
          <Text color={"$color9"}>Connecting</Text>
        ) : (
          <Text color={"$color12"}>Connect</Text>
        )}
      </Button>
    </View>
  );
};

export default LoginForm;

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <Text color={"$red10"} fontWeight={"500"}>
      {message}
    </Text>
  );
};
