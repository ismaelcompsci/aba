export type ServerConfig = {
  serverAddress: string;
  username: string;
  userId: string;
  token: string;
  index: number;
  name: string;
  id: string;
};

export type DeviceData = {
  serverConnectionConfigs: ServerConfig[];
  lastServerConnectionConfigId: string | undefined | null;
};
