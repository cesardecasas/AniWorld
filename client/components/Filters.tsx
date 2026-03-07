import { useState } from "react";
import CheckBox from "./CheckBox";
import EnumInfo from "./EnumInfo.json";
import { useRouter } from "next/router";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

interface GenreItem {
  code: number;
  name: string;
}

const Filters = () => {
  const router = useRouter();
  const [rate, setRate] = useState("");
  const [genre, setGenre] = useState("Genre");
  const [genreCode, setCode] = useState<number | null>(null);
  const [filters, setFilters] = useState(false);

  const onApply = () => {
    if (!rate && !genreCode) return;
    // Strip any existing filter params to avoid accumulation
    let base = router.asPath
      .replace(/&?rated=[^&]*/g, "")
      .replace(/&?genre=[^&]*/g, "");
    const params: string[] = [];
    if (rate) params.push(`rated=${rate}`);
    if (genreCode) params.push(`genre=${genreCode}`);
    router.push(`${base}&${params.join("&")}`);
  };

  const setGenreFilter = (gen: GenreItem) => {
    setCode(gen.code);
    setGenre(gen.name);
  };

  const onClear = () => {
    const n = router.asPath.split("page=1")[0];
    setGenre("Genre");
    router.push(`${n}page=1`);
  };

  return (
    <div>
      <p className="filters-section-title">Rating</p>
      {(EnumInfo as any).rated.map((rate: { name: string }, i: number) => {
        const n = rate.name.toUpperCase();
        return <CheckBox setfFilter={setRate} key={i} name={n} />;
      })}

      <p className="filters-section-title">Genre</p>
      <DropdownButton id="dropdown-basic-button" title={genre}>
        {(EnumInfo as any).genres.map((genre: GenreItem, i: number) => (
          <Dropdown.Item onClick={() => setGenreFilter(genre)} key={i}>
            {genre.name}
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
