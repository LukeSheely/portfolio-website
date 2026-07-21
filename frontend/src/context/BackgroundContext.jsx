import React, { createContext, useContext, useState } from "react";

/**
 * Lets any page temporarily take over the site background. Default is
 * "noir" (the aurora/shader). The Interests page swaps it to themed
 * animations on hover, then restores "noir".
 */
const BackgroundContext = createContext({ theme: "noir", setTheme: () => {} });

export function BackgroundProvider({ children }) {
  const [theme, setTheme] = useState("noir");
  return (
    <BackgroundContext.Provider value={{ theme, setTheme }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export const useBackground = () => useContext(BackgroundContext);
