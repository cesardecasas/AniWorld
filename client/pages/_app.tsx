import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AppProps } from "next/app";
import type { User } from "../types";

function MyApp({ Component, pageProps }: AppProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored !== null ? stored === "true" : prefersDark;
    setDarkMode(initial);
  }, []);

  // Apply data-theme attribute and persist whenever darkMode changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // The session is an httpOnly cookie, so only the server can say who is signed in
  const checkSession = async () => {
    // Tokens from before the cookie switch are no longer used
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try {
      const session = await api.get("/auth/session");
      setAuthenticated(true);
      setCurrentUser({
        userName: session.data.user.userName,
        id: session.data.user.id,
      });
    } catch {
      setCurrentUser(null);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const PageComponent = Component as React.ComponentType<Record<string, unknown>>;

  return (
    <Layout
      setCurrentUser={setCurrentUser}
      setAuthenticated={setAuthenticated}
      currentUser={currentUser}
      authenticated={authenticated}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      <PageComponent
        setCurrentUser={setCurrentUser}
        currentUser={currentUser}
        setAuthenticated={setAuthenticated}
        authenticated={authenticated}
        darkMode={darkMode}
        {...pageProps}
      />
    </Layout>
  );
}

export default MyApp;
