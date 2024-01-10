import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";

const initialState = {
  colorOne: { value: "", name: "" },
  colorTwo: { value: "", name: "" },
  colorThree: { value: "", name: "" },
  colorFour: { value: "", name: "" },
  rawResult: "",
};

export const useImageColors = (url?: string | null) => {
  const [gradientColors, setColors] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const getImageColors = async () => {
    try {
      setLoading(true);
      const result = await getColors(url || "", {
        fallback: "#ffffff",
        cache: true,
        quality: "lowest",
        key: url || "image-colors-key",
      });

      switch (result.platform) {
        case "android":
        case "web":
          setColors({
            colorOne: { value: result.lightVibrant, name: "lightVibrant" },
            colorTwo: { value: result.dominant, name: "dominant" },
            colorThree: { value: result.vibrant, name: "vibrant" },
            colorFour: { value: result.darkVibrant, name: "darkVibrant" },
            rawResult: JSON.stringify(result),
          });

          break;
        case "ios":
          setColors({
            colorOne: { value: result.background, name: "background" },
            colorTwo: { value: result.detail, name: "detail" },
            colorThree: { value: result.primary, name: "primary" },
            colorFour: { value: result.secondary, name: "secondary" },
            rawResult: JSON.stringify(result),
          });
          break;
        default:
          throw new Error("Unexpected platform");
      }
    } catch (error) {
      console.log("[GET_IMAGE_COLORS] get colors error ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getImageColors();
  }, [url]);

  return {
    ...gradientColors,
    isLoading: loading,
  };
};
