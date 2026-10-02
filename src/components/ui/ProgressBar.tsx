export function ProgressBar({
  value,
  max,
  big,
}: {
  value: number;
  max: number;
  big?: boolean;
}) {
  return (
    <div className={"bar" + (big ? " big" : "")}>
      <i style={{ width: `${(value / (max || 1)) * 100}%` }} />
    </div>
  );
}