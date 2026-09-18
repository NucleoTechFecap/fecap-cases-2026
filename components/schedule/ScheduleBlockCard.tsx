import type { ScheduleBlock } from "@/data/schedule";

function BlockHeader({ block }: { block: ScheduleBlock }) {
  return (
    <header className="schedule-block-header">
      <span className="schedule-time">{block.time}</span>
      <h3>{block.title}</h3>
      {"tag" in block && <span className="schedule-tag">{block.tag}</span>}
    </header>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
  );
}

export function ScheduleBlockCard({ block }: { block: ScheduleBlock }) {
  if (block.type === "break") {
    return (
      <div className="schedule-block schedule-break">
        <span className="schedule-time">{block.time}</span>
        <span className="schedule-break-line" aria-hidden="true" />
        <strong>{block.title}</strong>
        <span className="schedule-break-line" aria-hidden="true" />
      </div>
    );
  }

  if (block.type === "workshops") {
    return (
      <article className="schedule-block schedule-workshops">
        <BlockHeader block={block} />
        {block.sessions.map((session) => (
          <div className="workshop-card" key={session.label}>
            <div className="workshop-card-top">
              <strong>{session.label}</strong>
              <span className="schedule-tag">{session.room}</span>
            </div>
            <h4>{session.title}</h4>
            <p>{session.speaker}</p>
          </div>
        ))}
      </article>
    );
  }

  if (block.type === "activation") {
    return (
      <article className="schedule-block schedule-activation">
        <BlockHeader block={block} />
        <p>{block.description}</p>
      </article>
    );
  }

  return (
    <article className="schedule-block schedule-talk">
      <BlockHeader block={block} />
      <div className="talk-speaker">
        <div className="talk-avatar">
          <PersonIcon />
        </div>
        <div>
          <h4>{block.speaker.name}</h4>
          <p className="talk-role">{block.speaker.role}</p>
          <p className="talk-bio">{block.speaker.bio}</p>
        </div>
      </div>
      <p className="talk-moderator">
        Mediador: <strong>{block.moderator.name}</strong> — {block.moderator.role}
      </p>
    </article>
  );
}
