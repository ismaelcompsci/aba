import { useEffect } from "react";
import { Redirect, router, useRootNavigationState } from "expo-router";
import { useAtomValue } from "jotai";
import { Spinner, View } from "tamagui";

import { ScreenCenter } from "../components/center";
import { attemptingConnectionAtom, userAtom } from "../state/app-state";

export default function IndexPage() {
  const rootNavigationState = useRootNavigationState();

  const user = useAtomValue(userAtom);
  const attemptingConnection = useAtomValue(attemptingConnectionAtom);

  useEffect(() => {
    if (!user && !attemptingConnection) {
      router.push("/server-connect/");
    }
  }, [user, attemptingConnection]);

  if (!rootNavigationState?.key) return null;
  return (
    <>
      {attemptingConnection ? (
        <ScreenCenter>
          <Spinner />
        </ScreenCenter>
      ) : (
        <ScreenCenter>
          <Redirect href={"/library/"} />
        </ScreenCenter>
      )}
    </>
  );
}
