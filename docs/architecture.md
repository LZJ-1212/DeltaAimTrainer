# 架构与落地（摘要）

完整目标见对话中的产品方案。这里只保留实现时必须对齐的决策。

## 手感

- Pointer Lock 读取 `movementX/Y`
- `yaw/pitch = movement * sens * dpi * yawFactor`（UE yaw 初值 0.07，用游戏 180° 校准）
- 游戏水平 FOV → Three.js 垂直 FOV：`v = 2atan(tan(h/2)/aspect)`

## 射击

相机中心 Raycaster（NDC 0,0）打目标 Mesh。训练房低开销材质，目标 144Hz+。

## 模式

- **Flicking**：击破后立即刷新下一球；TTK、首发命中率
- **Tracking**：Sine + 随机 Lerp；Tracking Uptime

## 数据

`User`、`Session`；可选 `ShotLog`。Session 聚合：开火数、命中数、命中率、平均反应 ms、得分。
