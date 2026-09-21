export function Crosshair() {
  return (
    <div className="crosshair" aria-hidden>
      <span className="crosshair-arm crosshair-arm-h" />
      <span className="crosshair-arm crosshair-arm-v" />
      <span className="crosshair-dot" />
    </div>
  );
}
