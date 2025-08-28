// dashboard/src/context/liveContext.js
"use client";
import { createContext, useContext } from "react";

export const LiveContext = createContext(null);
export const useLiveData = () => useContext(LiveContext);
