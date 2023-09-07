import { Toast as TToast, ToastViewport, useToastState } from "@tamagui/toast";
import { YStack } from "tamagui";

export const Toast = () => {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <TToast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      backgroundColor={"$red10"}
      y={0}
      opacity={1}
      scale={1}
      animation="100ms"
      viewportName={currentToast.viewportName}
    >
      <YStack>
        <TToast.Title>{currentToast.title}</TToast.Title>
        {!!currentToast.message && (
          <TToast.Description>{currentToast.message}</TToast.Description>
        )}
      </YStack>
    </TToast>
  );
};
