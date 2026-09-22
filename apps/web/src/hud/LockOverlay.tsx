import { DeltaMark } from "./DeltaMark";

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
      <span className="lock-overlay-brand">
        <DeltaMark className="lock-overlay-mark" />
        三角洲靶场
      </span>
      <span className="lock-overlay-title">进入瞄准</span>
      <span className="lock-overlay-sub">
        锁定指针后按开镜手感训练。下方改 DPI、灵敏度、FOV。
      </span>
    </button>
  );
}
