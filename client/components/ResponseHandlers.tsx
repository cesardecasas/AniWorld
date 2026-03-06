interface ErrorCardProps {
  msg?: string;
}

export const ErrorCard = ({ msg }: ErrorCardProps) => {
  return (
    <div className="alert alert-danger" role="alert">
      No {msg} Found
    </div>
  );
};

export const Loader = () => {
  return (
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};
