# 测试约定

核心业务（灵敏度 / FOV / MDV）**先写测试再写实现**（TDD）。UI 与 R3F 用手工验证，不强制 E2E。

## 工具

- `packages/aim-math`：Vitest
- 每个导出函数至少覆盖：正常路径、边界（0、负数、FOV 上下限）、非法输入抛错或 clamp

## 必须锁住的行为

- `deg = movement * sens * 0.022`（`movementX` 不再乘 DPI）
- 水平 110°（16:9 Base）→ 垂直 FOV
- 红点 zoom 1.25、2 倍 zoom 2 的 `hAds`
- MDV 系数 1.33 的 `mdvScale`
- 机主配置：DPI 1600、sens 2 的 `cm/360 ≈ 13`

## 禁止

- 为了过测试去改公式凑数；公式以 `docs/delta-force-research.md` 为准，偏差用 `yawFactor` 单独暴露（对照步骤见 `docs/game-calibration.md`）
- 在 `useFrame` 里写依赖 React state 的断言（测纯函数，不测帧循环）
