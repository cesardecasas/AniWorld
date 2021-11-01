import ReactPlayer from "react-player"

const SongCard = (props)=>{
    const {url, title, id, album, artist, spotify} = props

    return(
        <div key={id} style={{border:"2px solid black", width:'70%', marginTop:'3%', borderRadius:'1.5rem',backgroundColor:'white', boxShadow:'12px 12px 2px 1px rgba(0, 0, 255, .2)'}}>
            <p style={{marginLeft:'10%', fontWeight:'bold'}}> {title}</p>
            <p>Album: {album}</p>
            <p>Artist: {artist}</p>
            <p>Listen the full song <a href={spotify}>here</a></p>
            {url ? <ReactPlayer data-testid="videoPlayer" url={url} controls={true} height='-30px' width='60%' style={{marginLeft:'20%'}}/> : <p style={{fontWeight:'bold'}}>No Preview Available</p>}
        </div>
    )
}

export default SongCard