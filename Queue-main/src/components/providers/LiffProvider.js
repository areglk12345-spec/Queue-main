"use client";
import { useEffect, createContext, useContext, useState } from "react";
import liff from "@line/liff";

const LiffContext = createContext({ liff: null, liffError: null, isInitialized: false });

export const useLiff = () => useContext(LiffContext);

export default function LiffProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [liffError, setLiffError] = useState(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId || liffId === "undefined") {
      console.warn("LIFF ID is missing.");
      return;
    }

    if (window.__LIFF_INIT_STARTED__) return;
    window.__LIFF_INIT_STARTED__ = true;

    console.log("Initializing LIFF with ID:", liffId);
    liff.init({ liffId })
      .then(async () => {
        console.log("LIFF initialized successfully");
        setIsInitialized(true);
        
        if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            console.log("Logged in as:", profile.displayName);
            
            // Automatically check for active queue in database to sync across devices/sessions
            try {
                const res = await fetch(`/api/queue/check-active?lineUserId=${profile.userId}`);
                const data = await res.json();
                if (data.active) {
                    console.log("Found active queue in DB, syncing to local storage:", data.id);
                    localStorage.setItem("myQueueId", data.id);
                }
            } catch (err) {
                console.error("Error syncing active queue:", err);
            }
        }
        
        if (liff.isInClient()) {
            console.log("Running inside LINE app");
        } else {
            console.log("Running in external browser");
        }
      })
      .catch((err) => {
        console.error("LIFF initialization failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        setLiffError(err.message || String(err));
        window.__LIFF_INIT_STARTED__ = false;
      });
  }, []);

  return (
    <LiffContext.Provider value={{ liff, liffError, isInitialized }}>
      {children}
    </LiffContext.Provider>
  );
}
