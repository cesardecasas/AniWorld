import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const client = axios.create({
    baseURL: "https://aniworld-api.herokuapp.com/",
  });

  const checkSession = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (token) {
      try {
        const session = await client.get("api/user/session", config);
        setAuthenticated(true);
        setCurrentUser({
          userName: session?.data?.user?.userName,
          id: session?.data?.user?.id,
        });
        localStorage.setItem(
          "user",
          JSON.stringify(session?.data?.user?.userName)
        );
      } catch (error) {
        console.log(error);
        setCurrentUser(null);
        setAuthenticated(false);
        localStorage.clear();
      }
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
