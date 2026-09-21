# 《三角洲行动》手感调研

调研日期：2026-09-21。用于 `packages/aim-math` 与 Pointer Lock 相机，**不是**官方 SDK。实现前仍需用游戏本体做 180° 校准。

## 必须改掉的假设

原方案里的 `UE_Yaw_Factor ≈ 0.07` 是 **UE4 / 无畏契约** 的常见值，**不是**三角洲。

多家换算器把《三角洲行动 / Delta Force: Hawk Ops》标成 **Modified Unreal Engine，yaw = 0.022**，与 CS2 同类：

| 来源 | 结论 |
| --- | --- |
| [MouseTester.io](https://mousetester.io/sensitivity/delta-force/) | yaw 0.022；默认灵敏度约 2；范围约 0.5–5 |
| [PSA Method 转换器](https://www.psamethod.cn/sensitivity-converter/) | 三角洲 yaw 0.022；VAL 才是 0.07 |
| [mouse-sensitivity.com](https://www.mouse-sensitivity.com/n/delta-force/) | 专业换算（含 ADS / 各倍镜） |

校验：800 DPI、sens 2、yaw 0.022 →  
`cm/360 = 360 / (800 × 2 × 0.022) × 2.54 ≈ 26.0 cm`，与 MouseTester 表一致。

## 视角公式（浏览器）

`Pointer Lock` 的 `movementX/Y` **已经是鼠标 count**，不要再乘 DPI。

```
deg = movement * sens * yaw          // yaw 默认 0.022
cm/360 = 360 / (dpi * sens * yaw) * 2.54
countsFor180 = 180 / (sens * yaw)
```

DPI 只用于：显示 cm/360、从鼠标垫距离反推。把 DPI 乘进 `movementX` 会转得过快。

## FOV

[DPI Wizard](https://www.mouse-sensitivity.com/forums/topic/10771-bug-report-%E4%B8%89%E8%A7%92%E6%B4%B2%E8%A1%8C%E5%8A%A8-delta-force/)：游戏 FOV 是 **Horizontal Degrees（16:9 Base）**，滑条大约 **60–120**。超宽/16:10 上显示值会按 16:9 锁定换算（例如设 120 在 16:10 可能显示约 114.6）。

社区常用腰射 FOV：**105–120**，很多指南从 **110** 起。

Three.js `camera.fov` 是垂直 FOV。匹配游戏时：

1. 用 **16/9** 把水平 FOV 转成垂直 FOV（不要用当前窗口宽高比去“假装游戏内水平角”）。
2. 把该垂直角赋给 `PerspectiveCamera`，`aspect` 用真实画布。

```ts
vFov = 2 * atan(tan(hFovRad / 2) / (16 / 9))
```

## 灵敏度体系（后期再做 ADS）

MVP 只对齐 **腰射 360° 距离**。游戏里还有：

- 水平 / 垂直倍率（先都当 1.0）
- ADS 类型：仅 MDV / 按倍率设灵敏度 / 两者组合
- 显示器距离系数（常见 1.33 垂直匹配，16:9 也有人用 1.78）
- 十余种倍镜；[DPI Wizard](https://www.mouse-sensitivity.com/forums/topic/9649-delta-force-high-zoom-sensitivity-feels-too-fast-using-the-calculator-low-zoom-feels-fine-please-help/) 称约 11 项会影响开镜
- **MDV 会影响腰射**：改 FOV 时游戏可能自动缩放腰射手感

游戏内小数位不多，换算会有误差，必须以垫上 180° 实测为准。

## 输入

Steam 讨论里有人改 `Input.ini`：

- `RawMouseInputEnabled=Enabled`
- `bEnableMouseSmoothing=False`
- `bViewAccelerationEnabled=False`

Windows 关闭「提高指针精确度」。本训练器只吃 raw `movementX/Y`，不要做加速。

## 跟枪模式可模拟的身法

官方站 [df.qq.com](https://df.qq.com/)：突击兵举镜移速更快；部分干员有**战术滑铲**、翻滚。社区训练建议：

- 滑铲：冲刺 + 蹲
- 急停：反向点一下方向键（有惯性，不是松键立刻准）
- 跳 peek：跳 + 左右探头
- 落地有短暂硬直，连跳不如 CS 流畅

Tracking 目标不要只做匀速平移：加变速、急停、短滑铲水平位移。

## 权威程度

| 可信 | 慎用 |
| --- | --- |
| mouse-sensitivity.com（DPI Wizard 实测） | 营销站「最佳设置」文 |
| MouseTester / PSA 的 yaw 与 cm/360 | 把三角洲写成 Source 引擎、或照抄 CS `cfg` |
| 官方 df.qq.com 干员技能描述 | 未经校准的 0.07 yaw |

## 实现默认值（可被设置覆盖）

- `yawFactor = 0.022`
- `hFovDeg = 110`（16:9 水平）
- `sens = 2`、`dpi = 800`（仅展示 cm/360）
- 校准：同一套参数下，浏览器 180° 滑动距离 = 游戏内 180°
