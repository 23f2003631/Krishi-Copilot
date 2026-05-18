"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { RoleType, ROLE_CONFIGS, RoleConfig } from "@/lib/config/roles";

interface RoleContextType {
  role: RoleType;
  roleConfig: RoleConfig;
  setRole: (role: RoleType) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "syngenta_copilot_active_role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("Campaign Manager");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as RoleType;
    if (storedRole && ROLE_CONFIGS[storedRole]) {
      setRoleState(storedRole);
    }
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!isMounted) {
    return <div className="min-h-screen bg-[#f8faf9]" />; 
  }

  return (
    <RoleContext.Provider value={{ role, roleConfig: ROLE_CONFIGS[role], setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
