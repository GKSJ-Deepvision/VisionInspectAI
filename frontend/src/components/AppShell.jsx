"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthToken } from "../services/api";
import { getCurrentUser } from "../services/authApi";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ title, subtitle, children, variant = "" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login");
      return;
    }

    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        // Backend offline or token invalid — use demo user so app still works
        setUser({
          id: 1,
          username: "quality_engineer",
          email: "demo@visioninspect.ai",
          role: "quality_engineer",
          full_name: "Quality Engineer",
          is_active: true,
        });
      })
      .finally(() => setReady(true));
  }, [router]);

  function handleSidebarToggle() {
    setSidebarCollapsed((current) => !current);
  }

  if (!ready) {
    return (
      <main className="loading-screen">
        <div className="loader" />
      </main>
    );
  }

  return (
    <div
      className={`app-layout${sidebarCollapsed ? " sidebar-collapsed" : ""}${variant ? ` ${variant}` : ""}`}
    >
      <Sidebar user={user} collapsed={sidebarCollapsed} onToggleCollapse={handleSidebarToggle} />
      <div className="app-main">
        <Navbar title={title} subtitle={subtitle} user={user} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
