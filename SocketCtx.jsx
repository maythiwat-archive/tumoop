'use client';

import { createContext, useContext, useRef } from "react";
import { io } from "socket.io-client";

/**
 * @typedef {Object} SocketContextParam
 * @property {import("socket.io-client").Socket | null} socket
 */

/** @type {import('react').Context<SocketContextParam>} */
export const SocketCtx = createContext(
  /** @type {SocketContextParam} */ ({ socket: null })
);

export const useSocketCtx = () => useContext(SocketCtx);

export const SocketCtxProvider = (props) => {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3333';

  const socketRef = useRef(
    io(url, {
      transports: ['websocket'],
    })
  );

  return (
    <SocketCtx.Provider value={{ socket: socketRef.current }}>
      {props.children}
    </SocketCtx.Provider>
  );
};
