import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { BiSearch } from "react-icons/bi";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Navigation from "react-bootstrap/Nav";
import { BsMoon, BsSun } from "react-icons/bs";
import NavDropdown from "react-bootstrap/NavDropdown";
import type { User } from "../types";

interface NavProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  authenticated: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
}

const Nav = ({
  darkMode,
  setDarkMode,
  authenticated,
  currentUser,
  setCurrentUser,
  setAuthenticated,
}: NavProps) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const logOut = () => {
    setCurrentUser(null);
    setAuthenticated(false);
    localStorage.clear();
  };

  const handleSubmit = () => {
    const cleanQuery = query.replace(" ", "_");
    if (router.pathname.includes("search")) {
      router.push(`anime=${cleanQuery}&page=1`);
    } else if (router.pathname.includes("anime")) {
      router.push(`/search/anime=${cleanQuery}&page=1`);
    } else if (
      router.pathname.includes("manga") ||
      router.pathname.includes("chapter")
    ) {
      router.push(`/search/anime=${cleanQuery}&page=1`);
    } else {
      router.push(`search/anime=${cleanQuery}&page=1`);
    }
  };

  return (
    <Navbar
      collapseOnSelect
      bg="dark"
      expand="sm"
      sticky="top"
      className="site-nav"
    >
      <Navigation.Link
        as={Link}
        id="brand"
        href="/"
        style={{ color: "white", marginLeft: "4%", fontSize: "20px" }}
      >
        AniWorld
      </Navigation.Link>

      {/* Collapsible content: links + search */}
      <Navbar.Collapse id="responsive-navbar-nav">
        <Navigation.Link as={Link} href="/manga" style={{ color: "white" }}>
          Manga
        </Navigation.Link>
        {authenticated && currentUser ? (
          <NavDropdown
            id="nav-dropdown-dark-example"
            title={currentUser.userName}
            menuVariant="dark"
          >
            <NavDropdown.Item as={Link} href={`/list/${currentUser.id}`}>
              My List
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} href={`/settings/${currentUser.id}`}>
              Settings
            </NavDropdown.Item>
            <NavDropdown.Item onClick={logOut}>Log Out</NavDropdown.Item>
          </NavDropdown>
        ) : (
          <Navigation.Link as={Link} href="/Login" style={{ color: "white" }}>
            Login
          </Navigation.Link>
        )}
        <Form
          className="d-flex nav-search"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FormControl
            type="search"
            placeholder="Search"
            aria-label="Search"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline-light">
            <BiSearch />
          </Button>
        </Form>
      </Navbar.Collapse>

      {/* Always visible: dark mode toggle + hamburger */}
      <div className="nav-actions">
        <button
          className="nav-dark-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <BsSun size={15} /> : <BsMoon size={15} />}
        </button>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          style={{ color: "white", backgroundColor: "grey" }}
        />
      </div>
    </Navbar>
  );
};

export default Nav;
