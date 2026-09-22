import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadWeeklyAccuracy, type AccuracyPoint } from "./sessionClient";

type HistoryPanelProps = {
  revision: number;
  saveError: string | null;
};

type ChartRow = {
  label: string;
  accuracy: number;
  modeLabel: string;
};

function formatPointLabel(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function toChartRows(points: AccuracyPoint[]): ChartRow[] {
  return points.map((point) => ({
    label: formatPointLabel(point.createdAt),
    accuracy: point.accuracy,
    modeLabel: point.mode === "flicking" ? "甩枪" : "跟枪",
  }));
}

export function HistoryPanel({ revision, saveError }: HistoryPanelProps) {
  const [points, setPoints] = useState<AccuracyPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    void loadWeeklyAccuracy()
      .then((next) => {
        if (!active) {
          return;
        }
        setPoints(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [revision]);

  const rows = toChartRows(points);

  return (
    <section className="history-panel" aria-label="最近一周命中率">
      <p className="history-kicker">个人面板</p>
      <h2>最近一周命中率</h2>
      {saveError ? <p className="history-error">{saveError}</p> : null}
      {status === "loading" ? <p>正在读取最近一周。</p> : null}
      {status === "error" ? <p className="history-error">记录读不出来。先确认数据库和 API 已启动。</p> : null}
      {status === "ready" && rows.length === 0 ? (
        <p>最近一周还没有结算。打完 60 秒后，刷新页面仍能看到这条折线。</p>
      ) : null}
      {status === "ready" && rows.length > 0 ? (
        <div className="history-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} title="最近一周命中率">
              <CartesianGrid stroke="#3d382c" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9a907c", fontSize: 11 }}
                axisLine={{ stroke: "#3d382c" }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={[0, 1]}
                width={32}
                tickFormatter={(value: number) => `${Math.round(value * 100)}`}
                tick={{ fill: "#9a907c", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#221f18",
                  border: "1px solid #e25a1c",
                  color: "#ebe4d6",
                }}
                formatter={(value) => [`${Math.round(Number(value) * 100)}%`, "命中率"]}
                labelFormatter={(_label, payload) => {
                  const row = payload?.[0]?.payload as ChartRow | undefined;
                  if (!row) {
                    return "";
                  }
                  return `${row.modeLabel} · ${row.label}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#E25A1C"
                strokeWidth={2}
                dot={{ r: 3, fill: "#E25A1C" }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
