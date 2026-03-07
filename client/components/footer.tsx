import { SiGithub, SiLinkedin } from "react-icons/si";
import { CgWebsite } from "react-icons/cg";
import { TiDocument } from "react-icons/ti";

interface FooterProps {
  darkMode?: boolean;
}

const Footer = ({ darkMode }: FooterProps) => {
  return (
    <footer>
      <div style={{ marginBottom: "0.75rem" }}>
        <a className="icon" href="https://www.linkedin.com/in/cesardecasas/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <SiLinkedin />
        </a>
        <a className="icon" href="https://github.com/cesardecasas" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <SiGithub />
        </a>
        <a className="icon" href="https://cesardecasas.com/" target="_blank" rel="noopener noreferrer" aria-label="Website">
          <CgWebsite />
        </a>
        <a className="icon" href="https://drive.google.com/file/d/136sfn_Cyy1ApZP9rf7h8d4hj5_o0XIQt/view" target="_blank" rel="noopener noreferrer" aria-label="Resume">
          <TiDocument />
        </a>
      </div>
      <small style={{ fontSize: "0.78rem", letterSpacing: "0.3px" }}>
        Created by Cesar De Casas
      </small>
    </footer>
  );
};

export default Footer;
