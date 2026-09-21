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

## 开镜（优先，训练默认就是开镜）

机主设定：**举枪灵敏度类型 = 仅 MDV**，系数 **1.33**，加成全 1.00，**瞄准镜镜内放大 = 关**。实战基本开镜，训练器默认用开镜 FOV + MDV 缩放后的 yaw，不要只对齐腰射 360°。

MDV 1.33 = 垂直 Monitor Distance 133%，在 16:9 上约等于 MDH 75% / 4:3 边缘（[DPI Wizard](https://www.mouse-sensitivity.com/forums/topic/9030-confusion-about-mdv-and-mdh/)）。

垂直 FOV 用弧度：

```
mdvScale = atan(coeff * tan(adsVFov / 2)) / atan(coeff * tan(hipVFov / 2))
yawAds   = yawHip * mdvScale * adsMultiplier   // adsMultiplier 当前为 1
```

`coeff = 0` 时退化为焦点匹配：`tan(adsVFov/2) / tan(hipVFov/2)`。

相机 `fov` 用 **开镜垂直 FOV**，不是腰射 110。1x 红点在「镜内放大关」时仍会放大（社区体感大约 70–90 水平 FOV），精确值随改枪「缩放倍率」变化，必须按倍镜做成设置并实测。

## 显示

- 2560×1440、区域宽高比 16:9、全屏、刷新 170、局内帧数上限 165
- 默认 FOV 110.0，载具第三人称 100，VSync 关

## 实现默认值（机主实测配置）

来自游戏内截图 + 口述：

| 项 | 值 |
| --- | --- |
| 鼠标 DPI | 1600 |
| 鼠标灵敏度 | 2.00 |
| 垂直 / 水平灵敏度 | 1.00 / 1.00 |
| FOV | 110 |
| 举枪灵敏度加成 / 开镜水平垂直 | 全 1.00 |
| 举枪灵敏度类型 | 仅 MDV |
| 屏幕距离系数 | 1.33 |
| 灵敏度切换 | 举枪过程中过渡 |
| 反转 | 步行关；飞行载具开 |

推算腰射（yaw 0.022，未计入 MDV 对腰射的可能缩放）：

- `cm/360 ≈ 360 / (1600 × 2 × 0.022) × 2.54 ≈ 13.0 cm`
- 180° ≈ 6.5 cm

训练默认对齐**开镜 MDV**，腰射公式只作基底。校准：开镜状态下浏览器滑到屏幕同一相对位置（例如准星到屏幕上沿附近）的垫上距离 = 游戏内开镜同样操作。
