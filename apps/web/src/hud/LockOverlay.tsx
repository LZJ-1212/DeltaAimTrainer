type LockOverlayProps = {
  visible: boolean;
  onEnter: () => void;
};

export function LockOverlay({ visible, onEnter }: LockOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <button type="button" className="lock-overlay" onClick={onEnter}>
      <span className="lock-overlay-kicker">训练房</span>
      <span className="lock-overlay-title">点击进入瞄准</span>
      <span className="lock-overlay-sub">指针锁定后，手感按三角洲开镜 MDV 1.33</span>
    </button>
  );
}
