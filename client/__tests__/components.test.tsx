import { fireEvent, render, screen } from "@testing-library/react";
import { PosterCard } from "../components/ui/PosterCard";
import { WithSpoilers } from "../components/Tavern";
import { Pagination } from "../components/ui/Pagination";

jest.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({}) }));

describe("PosterCard", () => {
  it("links to the title with its score", () => {
    render(<PosterCard href="/anime/1" title="Mushishi" image="https://s4.anilist.co/x.jpg" score={8.7} meta="TV · 26 eps" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/anime/1");
    expect(screen.getByText("Mushishi")).toBeInTheDocument();
    expect(screen.getByText("8.7")).toBeInTheDocument();
  });

  it("shows the initial when there is no cover and hides a zero score", () => {
    render(<PosterCard href="/manga/2" title="Berserk" image={null} score={0} />);
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText(/Score/)).not.toBeInTheDocument();
  });
});

describe("WithSpoilers", () => {
  it("hides ||marked|| text until revealed", () => {
    render(
      <p>
        <WithSpoilers text={"Great ending. ||Himmel dies|| early."} />
      </p>,
    );
    expect(screen.queryByText("Himmel dies")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reveal/ }));
    expect(screen.getByText("Himmel dies")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("keeps filters and drops page=1", () => {
    render(<Pagination page={2} hasNext params={{ genre: "Drama", q: undefined }} basePath="/search" />);
    expect(screen.getByText("← Previous").closest("a")).toHaveAttribute("href", "/search?genre=Drama");
    expect(screen.getByText("Next →").closest("a")).toHaveAttribute("href", "/search?genre=Drama&page=3");
  });
});
