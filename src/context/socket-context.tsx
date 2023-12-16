import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { io, Socket } from "socket.io-client";

import {
  mediaProgressAtom,
  requestInfoAtom,
  socketConnectedAtom,
} from "../state/app-state";
import { MediaProgress, User } from "../types/aba";
import { debounce } from "../utils/utils";

const SocketContext = createContext<Socket | null>(null);
export default SocketContext;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { serverAddress, token } = useAtomValue(requestInfoAtom);
  const setSocketConnected = useSetAtom(socketConnectedAtom);
  const setMediaProgress = useSetAtom(mediaProgressAtom);

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const socketOptions = {
      transports: ["websocket"],
      upgrade: false,
    };

    console.debug("[SOCKET] connecting socket");

    const onConnect = () => {
      console.debug(`[SOCKET] socket conncted to ${socket.current?.id}`);
      setSocketConnected(true);
      console.log(token);
      socket.current?.emit("auth", token);
    };

    const onDisconnect = (reason: string) => {
      console.debug(`[SOCKET] socket disconncted: ${reason}`);
      setSocketConnected(false);
    };

    const onInit = () => {
      console.debug("[SOCKET] Initial socket data received");
    };

    const onUserUpdated = debounce((user: User) => {
      console.debug("[SOCKET] User updated", user.username);
      // setUser((prev) => {
      //   if (prev && prev.id == user.id) {
      //     return user;
      //   }
      //   return prev;
      // });

      setMediaProgress((prev) => {
        if (user.mediaProgress.length > prev.length) {
          return [
            ...prev.slice(0, user.mediaProgress.length - 1),
            user.mediaProgress[user.mediaProgress.length - 1],
          ];
        }

        if (user.mediaProgress.length === prev.length) {
          return prev.map((value, i) => {
            if (value?.ebookLocation !== user.mediaProgress[i]?.ebookLocation) {
              return user.mediaProgress[i];
            }
            return {
              ...value,
            };
          });
        } else {
          let i = 0;
          for (; i < user.mediaProgress.length; i++) {
            if (user.mediaProgress[i].id !== prev[i].id) {
              break;
            }
          }
          return [...prev.slice(0, i), ...prev.slice(i + 1)];
        }
      });
    }, 1000);

    const onUserItemProgressUpdated = (payload: {
      id: string;
      data: MediaProgress;
    }) => {
      console.debug("[SOCKET] user item progress updated");

      const { data } = payload;
      // @ts-ignore
      setMediaProgress((prev: MediaProgress[]) => {
        if (!data || !prev) return prev;

        const copyPrev = [...prev];

        if (!copyPrev) return;

        const mediaProgressIndex = copyPrev.findIndex(
          (mp) => mp.id === data.id
        );

        if (mediaProgressIndex >= 0) {
          copyPrev.splice(mediaProgressIndex, 1, data);
        } else {
          copyPrev.push(data);
        }
        return copyPrev;
      });
    };

    if (!socket.current?.id) {
      socket.current = io(serverAddress, socketOptions);
      socket.current.on("connect", onConnect);
      socket.current.on("disconnect", onDisconnect);
      socket.current.on("init", onInit);
      socket.current.on("user_updated", onUserUpdated);
      socket.current.on(
        "user_item_progress_updated",
        onUserItemProgressUpdated
      );
    }

    return () => {
      console.log("DISCONNECTING SOCKET");
      socket.current?.disconnect();
    };
  }, [serverAddress, token]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useAudioBookShelfSocket = () => useContext(SocketContext);
