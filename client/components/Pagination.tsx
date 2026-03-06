import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Pagination = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const changePage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    let url = router.asPath;
    if (target.innerHTML === "Next") {
      router.push(`${url.replace(`page=${page}`, `page=${page + 1}`)}`);
    } else if (target.innerHTML === "Previous") {
      router.push(`${url.replace(`page=${page}`, `page=${page - 1}`)}`);
    }
  };

  useEffect(() => {
    const type = router.query.type as string;
    if (type) {
      setPage(parseInt(type.split("page=")[1]));
    }
  }, [router.query.type]);

  return (
    <nav aria-label="Page navigation example" style={{ gridColumn: "2" }}>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <a
            className="page-link"
            onClick={page === 1 ? undefined : (e) => changePage(e)}
          >
            Previous
          </a>
        </li>
        <li className="page-item">
          <a className="page-link" onClick={(e) => changePage(e)}>
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
