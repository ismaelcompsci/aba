import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button, Input, Label, Stack, Text, XStack } from "tamagui";
import { z } from "zod";

import { pingServer } from "../../utils/api";
import { ErrorMessage } from "../error-message";

import { AddServerFormFrame } from "./form";

const loginSchema = z.object({
  serverAddress: z
    .string()
    .trim()
    .min(1, { message: "Server Address is required" }),
  username: z.string().min(1, { message: "username required" }),
  password: z.string().min(1, { message: "password required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

interface AddServerFormProps {
  setShowAddServerForm: (show: boolean) => void;
}

const AddServerForm = ({ setShowAddServerForm }: AddServerFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      serverAddress: "http://192.168.1.158:54932", // TODO REMOVE
      username: "owner_ismael", // TODO REMOVE
      password: "", // TODO REMOVE
    },
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      setLoading(true);

      const ping = await pingServer(data.serverAddress);
      if (!ping.success) {
        return form.setError("serverAddress", {
          type: "custom",
          message: ping.message,
        });
      }

      const response = await requestServerLogin(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const requestServerLogin = async (data: LoginSchema) => {
    const options = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    return axios.post(
      `${data.serverAddress}/login`,
      {
        username: data.username,
        password: data.password,
      },
      options
    );
  };

  return (
    <AddServerFormFrame>
      <Controller
        control={form.control}
        name="serverAddress"
        render={({ field, fieldState }) => (
          <Stack space={"$space.1.5"}>
            <Label htmlFor="serverAddress">Server Address</Label>
            <Input
              placeholder="http://555.555.5.555:5555"
              onBlur={field.onBlur}
              value={field.value}
              // disabled={loading}
              onChangeText={field.onChange}
            />
            {!!fieldState.error?.message && (
              <ErrorMessage>{fieldState.error?.message}</ErrorMessage>
            )}
          </Stack>
        )}
      />
      <Controller
        control={form.control}
        name="username"
        render={({ field, fieldState }) => (
          <Stack space={"$space.1.5"}>
            <Label htmlFor="username">Username</Label>
            <Input
              placeholder="root"
              onBlur={field.onBlur}
              value={field.value}
              // disabled={loading}
              onChangeText={field.onChange}
            />
            {!!fieldState.error?.message && (
              <ErrorMessage>{fieldState.error?.message}</ErrorMessage>
            )}
          </Stack>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Stack space={"$space.1.5"}>
            <Label htmlFor="password">Password</Label>
            <Input
              placeholder="password"
              onBlur={field.onBlur}
              textContentType="password"
              secureTextEntry
              // disabled={loading}
              value={field.value}
              onChangeText={field.onChange}
            />
            {!!fieldState.error?.message && (
              <ErrorMessage>{fieldState.error?.message}</ErrorMessage>
            )}
          </Stack>
        )}
      />

      <XStack w={"100%"} gap={"$4"}>
        <Button
          theme="red"
          flex={1}
          onPress={() => setShowAddServerForm(false)}
        >
          <Text>Go back</Text>
        </Button>
        <Button
          flex={1}
          onPress={form.handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text>Connect</Text>
        </Button>
      </XStack>
    </AddServerFormFrame>
  );
};

export default AddServerForm;
