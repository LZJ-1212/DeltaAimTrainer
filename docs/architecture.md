# 架构与落地（摘要）

完整目标见对话中的产品方案。这里只保留实现时必须对齐的决策。

## 手感

- Pointer Lock 读取 `movementX/Y`（已是 count，不要再乘 DPI）
- 腰射：`deg = movement * sens * 0.022`
- 开镜（训练默认红点，可切 2 倍）：MDV 1.33；精校默认
  `hAds ≈ 2atan(tan(hHip/2)/zoom)`（红点 zoom=1，2倍 zoom=2）
  `scale = atan(1.33 * tan(adsV/2)) / atan(1.33 * tan(hipV/2))`
- 机主：2560×1440 16:9、170Hz、FOV 110、DPI 1600、sens 2、仅 MDV 1.33、镜内放大关
- 细节见 `docs/delta-force-research.md`

## 射击

相机中心 Raycaster（NDC 0,0）打目标 Mesh。训练房低开销材质，目标 144Hz+。

## 模式

- **Flicking**：击破后立即刷新下一球；TTK、首发命中率
- **Tracking**：Sine + 随机 Lerp；Tracking Uptime

## 数据

`User`、`Session`；可选 `ShotLog`。Session 聚合：开火数、命中数、命中率、平均反应 ms、得分。
