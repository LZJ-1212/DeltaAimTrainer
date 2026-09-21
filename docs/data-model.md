# 数据模型（全栈阶段再建）

PostgreSQL + Prisma。MVP 不建库。关系两端都要写 `@relation`；表含 `createdAt` / `updatedAt`。

```prisma
model User {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  dpi       Int       @default(1600)
  sens      Float     @default(2)
  hFovDeg   Float     @default(110)
  sessions  Session[]
}

model Session {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  mode          String   // flicking | tracking
  optic         String   // redDot | scope2x
  score         Int
  shotsFired    Int
  shotsHit      Int
  accuracy      Float
  avgReactionMs Int?
  trackingUptime Float?
  shotLogs      ShotLog[]

  @@index([userId, createdAt])
}

model ShotLog {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id])
  offsetX     Float
  offsetY     Float
  reactionMs  Int
  hit         Boolean

  @@index([sessionId])
}
```

`ShotLog` 可选，热力图再用。
