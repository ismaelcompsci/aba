import { AccessibilityInfo, findNodeHandle } from "react-native";

export const setFocus = (element: React.Component | null) => {
  if (element == null) return;

  const elementId = findNodeHandle(element);
  if (elementId) {
    AccessibilityInfo.setAccessibilityFocus(elementId);
    AccessibilityInfo.setAccessibilityFocus(elementId);
  }
};
