# DeltaAimTrainer

浏览器端《三角洲行动》练枪工具：用 Pointer Lock 还原 UE5 鼠标手感，提供拉枪 / 跟枪训练，并记录命中率与反应时间。

> 当前状态：MVP 视角可跑（Pointer Lock + 开镜 MDV + 准星）。射击闭环尚未做。

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

```bash
npm install
npm test
npm run dev
```

浏览器打开 Vite 提示的地址（默认 http://localhost:5173）。点击画面锁定指针；`1` 红点，`2` 切 2 倍，`Esc` 退出锁定。

规划目录：

```
apps/web          # 练枪前端
apps/api          # 训练数据 API
packages/aim-math # 灵敏度 / FOV 换算（带单测）
```

## 文档

| 文件 | 内容 |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | 手感与模块决策 |
| [docs/delta-force-research.md](docs/delta-force-research.md) | 游戏调研与机主配置 |
| [docs/coding-standards.md](docs/coding-standards.md) | 代码规范 |
| [docs/testing.md](docs/testing.md) | 测试与 TDD |
| [docs/roadmap.md](docs/roadmap.md) | 阶段验收 |
| [docs/data-model.md](docs/data-model.md) | Prisma 模型（后置） |


## License

[MIT](./LICENSE)
