# DeltaAimTrainer

浏览器端《三角洲行动》练枪工具：用 Pointer Lock 还原 UE5 鼠标手感，提供拉枪 / 跟枪训练，并记录命中率与反应时间。

> 当前状态：仓库脚手架与工程约定已就绪，应用代码尚未开始（先做 MVP：锁定指针 + 自定义视角 + 准星）。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React + TypeScript + Vite + React Three Fiber |
| 状态 | Zustand（得分/结算）；相机用 ref |
| 后端 | Node.js + Express + Prisma（后置） |
| 数据库 | PostgreSQL |
| 图表 | Recharts |

视觉：深色模式 + 青柠强调色 `#DEFF9A`。

## 本地开发

应用尚未初始化。规划目录：

```
apps/web          # 练枪前端
apps/api          # 训练数据 API
packages/aim-math # 灵敏度 / FOV 换算（带单测）
```

## License

[MIT](./LICENSE)
