import { useState } from "react";
import CheckBox from "./CheckBox";
import EnumInfo from "./EnumInfo.json";
import { useRouter } from "next/router";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

// Values match AniList's MediaFormat enum and genre names
const Filters = () => {
  const router = useRouter();
  const [format, setFormat] = useState("");
  const [genre, setGenre] = useState("");

  const stripFilters = (path: string) =>
    path.replace(/&?format=[^&]*/g, "").replace(/&?genre=[^&]*/g, "").replace(/page=\d+/, "page=1");

  const onApply = () => {
    if (!format && !genre) return;
    const params: string[] = [];
    if (format) params.push(`format=${format}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre.replace(/\s+/g, "_"))}`);
    router.push(`${stripFilters(router.asPath)}&${params.join("&")}`);
  };

  const onClear = () => {
    setFormat("");
    setGenre("");
    router.push(stripFilters(router.asPath));
  };

  return (
    <div>
      <p className="filters-section-title">Format</p>
      {EnumInfo.formats.map((f) => (
        <CheckBox key={f.value} group="format" name={f.name} value={f.value} setfFilter={setFormat} />
      ))}

      <p className="filters-section-title">Genre</p>
      <DropdownButton id="dropdown-basic-button" title={genre || "Genre"}>
        {EnumInfo.genres.map((g) => (
          <Dropdown.Item onClick={() => setGenre(g)} key={g}>
            {g}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      <div className="filters-actions">
        <button className="filters-apply-btn" onClick={onApply}>Apply</button>
        <button className="filters-clear-btn" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
};

export default Filters;
