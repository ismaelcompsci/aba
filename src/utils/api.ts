export const pingServer = async (
  baseUrl: string
): Promise<{ success: boolean; title?: string; message?: string }> => {
  return fetch(`${baseUrl}/ping`)
    .then((response) => response.json())
    .then((data) => {
      return { success: data.success };
    })
    .catch((error) => {
      console.error("Server ping failed", error);
      const errorMessage = {
        success: false,
        title: error.message || error,
        message: "Failed to ping server",
      };

      return errorMessage;
    });
};
