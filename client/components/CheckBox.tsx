interface CheckBoxProps {
  name: string;
  value?: string;
  group?: string;
  setfFilter?: (value: string) => void;
}

const CheckBox = ({ name, value, group = "filter", setfFilter }: CheckBoxProps) => {
  const id = `${group}-${value ?? name}`;

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name={group}
        id={id}
        onChange={() => setfFilter?.(value ?? name.toLowerCase())}
      />
      <label className="form-check-label" htmlFor={id}>
        {name}
      </label>
    </div>
  );
};

export default CheckBox;
