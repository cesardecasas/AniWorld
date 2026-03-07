import ReactPlayer from "react-player";

interface SongCardProps {
  url: string | null;
  title: string;
  id: number;
  album: string;
  artist: string;
  spotify: string;
}

const SongCard = ({ url, title, id, album, artist, spotify }: SongCardProps) => {
  return (
    <div key={id} className="songCard">
      <p className="songTitle">{title}</p>
      <p className="songMeta">
        <span>{artist}</span>
        <span className="songDot">·</span>
        <span>{album}</span>
      </p>
      {url ? (
        <ReactPlayer
          data-testid="videoPlayer"
          url={url}
          controls={true}
          height="48px"
          width="100%"
          style={{ marginTop: "0.5rem" }}
        />
      ) : (
        <p className="songNoPreview">No preview available</p>
      )}
      <a
        className="songSpotify"
        href={spotify}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in Spotify →
      </a>
    </div>
  );
};

export default SongCard;
