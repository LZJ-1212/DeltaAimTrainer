# 代码规范

沟通用中文，标识符用英文。函数组件 + Hooks，不用 Class Component。

## 命名

- 文件：组件 `PascalCase.tsx`，其余 `camelCase.ts`；测试 `*.test.ts`
- 函数/变量：`getUserProfile`、`shotsHit`；布尔 `isLocked` / `hasHit`
- React 组件与 Zustand store：`useTrainingStore`，不要 `useStore`

## 分层

| 放这里 | 不放这里 |
| --- | --- |
| `packages/aim-math`：灵敏度、FOV、MDV 纯函数 | R3F 组件、DOM、fetch |
| `apps/web` 的 ref：相机 yaw/pitch、准星 | 每帧 `setState` |
| Zustand：得分、倒计时、模式、结算 | 相机朝向 |
| `apps/api` 的 repository / service | 路由里直接拼 SQL；R3F 里打 HTTP |

输入必须校验（`sens > 0`、FOV 范围）。异常早返回，不要吞掉。

## TypeScript

- `strict`；禁止无意义 `any`；对外 API 用明确类型
- 纯函数无副作用，便于单测
- 日期/时间戳用 ISO 字符串或 `Date`，展示层再格式化

## UI

- 深色底，强调色 `#DEFF9A`
- 训练 HUD 在 Canvas 外的 DOM；3D 内不做复杂 HTML

## 写代码前

先读 `docs/roadmap.md` 当前阶段验收，再按任务读：规范用本文；公式用 `testing.md` + `delta-force-research.md`；后端用 `data-model.md`。库 API 用 Context7，不要凭记忆。

## Git

- 不提交 `.cursor/`、`.agent/`、`.agents/`、`.env`、`node_modules/`
- 提交说明写原因，英文或中文均可，一句话即可
