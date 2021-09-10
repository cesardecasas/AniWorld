import Link from "next/dist/client/link"

const SearchCard =(props)=>{
    const{name, image, rated, episodes, id, synopsis, score} = props

    return(
        <div className="card mb-3" style={{maxWidth:'100%'}}>
        <div className="row g-0">
            <div className="col-md-4">
            <img src={image} className="img-fluid rounded-start" alt="Anime poster"/>
            </div>
            <div className="col-md-8">
            <div className="card-body">
                <h5 className="card-title">{name}</h5>
                <p className="card-text">Episodes: {episodes}</p>
                <p className="card-text">{score}/10</p>
                <p className="card-text"> {synopsis}</p>
                <p className="card-text"><small className="text-muted">Rated: {rated}</small></p>
                <Link href={`/anime/${id}`} passHref>
                    <a  className="btn btn-primary" style={{position:'revert'}}>Details</a>
                </Link>
            </div>
            </div>
        </div>
        </div>
    )
}

export default SearchCard