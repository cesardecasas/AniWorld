import Nav from "./nav";
import Footer from "./footer";
import type { User } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  authenticated: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

export default function Layout({
  children,
  darkMode,
  setDarkMode,
  authenticated,
  currentUser,
  setCurrentUser,
  setAuthenticated,
}: LayoutProps) {
  return (
    <>
      <Nav
        currentUser={currentUser}
        authenticated={authenticated}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setCurrentUser={setCurrentUser}
        setAuthenticated={setAuthenticated}
      />
      <main>{children}</main>
      <Footer darkMode={darkMode} />
    </>
  );
}
