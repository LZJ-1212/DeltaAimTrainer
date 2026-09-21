# 架构与落地（摘要）

完整目标见对话中的产品方案。这里只保留实现时必须对齐的决策。

## 手感

- Pointer Lock 读取 `movementX/Y`（已是 count，不要再乘 DPI）
- `yaw/pitch = movement * sens * yawFactor`（三角洲 yaw 初值 **0.022**，不是 VAL 的 0.07；用游戏 180° 校准）
- 游戏水平 FOV 为 16:9 Base → Three.js 垂直 FOV：`v = 2atan(tan(h/2)/(16/9))`
- 细节与出处见 `docs/delta-force-research.md`

## 射击

相机中心 Raycaster（NDC 0,0）打目标 Mesh。训练房低开销材质，目标 144Hz+。

## 模式

- **Flicking**：击破后立即刷新下一球；TTK、首发命中率
- **Tracking**：Sine + 随机 Lerp；Tracking Uptime

## 数据

`User`、`Session`；可选 `ShotLog`。Session 聚合：开火数、命中数、命中率、平均反应 ms、得分。
