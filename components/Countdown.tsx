"use client";

import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type CountdownLabels = { days: string; hours: string; minutes: string; seconds: string };

type CountdownProps = {
  targetDate: string;
  labels?: CountdownLabels;
  /** Mensagem exibida quando a data chega. Sem mensagem, o contador para em 00. */
  finishedMessage?: string;
};

const EMPTY: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
const DEFAULT_LABELS: CountdownLabels = { days: "dias", hours: "horas", minutes: "min", seconds: "seg" };

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown({ targetDate, labels = DEFAULT_LABELS, finishedMessage }: CountdownProps) {
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(EMPTY);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const tick = () => {
      setTimeLeft(getTimeLeft(target));
      setFinished(target.getTime() <= Date.now());
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (finished && finishedMessage) {
    return (
      <p className="countdown-finished" role="status">
        {finishedMessage}
      </p>
    );
  }

  const items = [
    [pad(timeLeft.days), labels.days, "days"],
    [pad(timeLeft.hours), labels.hours, "hours"],
    [pad(timeLeft.minutes), labels.minutes, "minutes"],
    [pad(timeLeft.seconds), labels.seconds, "seconds"],
  ];

  return (
    <div className="countdown-grid" aria-label="Contagem regressiva para o evento">
      {items.map(([value, label, key], index) => (
        <div className="countdown-pair" key={key}>
          <div className="countdown-card">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
          {index < items.length - 1 && <span className="countdown-colon">:</span>}
        </div>
      ))}
    </div>
  );
}
