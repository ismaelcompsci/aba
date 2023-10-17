import axios from "axios";

export const pingServer = async (
  baseUrl: string
): Promise<{ success: boolean; title?: string; message?: string }> => {
  try {
    const response = await axios.get(`${baseUrl}/ping`);
    return { success: response.data.success };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Server ping failed", error);

      const errorMessage = {
        success: false,
        title: error.message || "",
        message: "Failed to ping server",
      };
      return errorMessage;
    }
    return {
      success: false,
      title: "Server Error",
      message: "Failed to ping server",
    };
  }
};
