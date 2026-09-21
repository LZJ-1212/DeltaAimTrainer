# DeltaAimTrainer — Agent 约定

本仓库的 `.cursor/` 与 `.agent/` **不会推送到 GitHub**。克隆后请在本机保留本地规则；以下约定对所有贡献者有效。

## 栈

React + TypeScript + Vite + R3F + Zustand；后端阶段再加 Express + Prisma + PostgreSQL。强调色 `#DEFF9A`，深色训练房。

## 阶段（按顺序）

1. Pointer Lock + 自定义视角 + 中心准星
2. Raycaster 命中静态球
3. 腰射 yaw 0.022 **且** 开镜 MDV 1.33（训练默认开镜）
4. Flicking / Tracking
5. 历史 Session API 与折线图

## 硬约束

- 灵敏度/FOV 纯函数放独立包，先测后接相机
- 相机与准星用 ref；得分/倒计时用 Zustand
- 禁止提交 `.cursor/`、`.agent/`、`.agents/`、`.env`
- 规范详见 `docs/coding-standards.md`、`docs/testing.md`、`docs/roadmap.md`
- 写代码前先读当前阶段验收，再只读本次相关文档（见 `docs/coding-standards.md`「写代码前」）
