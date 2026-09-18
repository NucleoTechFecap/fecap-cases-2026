export type WorkshopSession = {
  label: string;
  room: string;
  title: string;
  speaker: string;
};

export type ScheduleBlock =
  | { type: "workshops"; time: string; title: string; tag: string; sessions: WorkshopSession[] }
  | { type: "activation"; time: string; title: string; tag: string; description: string }
  | {
      type: "talk";
      time: string;
      title: string;
      tag: string;
      speaker: { name: string; role: string; bio: string };
      moderator: { name: string; role: string };
    }
  | { type: "break"; time: string; title: string };

export type ScheduleDay = {
  id: string;
  label: string;
  blocks: ScheduleBlock[];
};

const PLACEHOLDER_SPEAKER = {
  name: "[Nome do Palestrante]",
  role: "[Cargo] — [Empresa / Área de Atuação]",
  bio: "[Mini bio do palestrante com até duas linhas de texto descrevendo trajetória e área de especialização.]",
};

const PLACEHOLDER_MODERATOR = { name: "[Nome do Mediador]", role: "[Cargo]" };

const PLACEHOLDER_ACTIVATION = "[Descrição da ativação ou nome do artista / convidado cultural]";

// Todas as noites seguem a mesma grade; troque os placeholders pelo conteúdo real de cada dia.
function createDayBlocks(): ScheduleBlock[] {
  return [
    {
      type: "workshops",
      time: "17h45–18h45",
      title: "Workshops",
      tag: "Salas Simultâneas",
      sessions: [
        {
          label: "Workshop A",
          room: "Sala 101",
          title: "[Título do Workshop A]",
          speaker: "[Nome do Palestrante] — [Cargo / Descrição]",
        },
        {
          label: "Workshop B",
          room: "Sala 102",
          title: "[Título do Workshop B]",
          speaker: "[Nome do Palestrante] — [Cargo / Descrição]",
        },
      ],
    },
    { type: "activation", time: "19h00–19h30", title: "Ativação", tag: "Teatro", description: PLACEHOLDER_ACTIVATION },
    {
      type: "talk",
      time: "19h30–20h40",
      title: "Palestra 1",
      tag: "Teatro",
      speaker: PLACEHOLDER_SPEAKER,
      moderator: PLACEHOLDER_MODERATOR,
    },
    { type: "break", time: "20h40–21h00", title: "Intervalo" },
    { type: "activation", time: "21h00–21h30", title: "Ativação 2", tag: "Teatro", description: PLACEHOLDER_ACTIVATION },
    {
      type: "talk",
      time: "21h30–22h40",
      title: "Palestra 2",
      tag: "Teatro",
      speaker: PLACEHOLDER_SPEAKER,
      moderator: PLACEHOLDER_MODERATOR,
    },
  ];
}

export const SCHEDULE_DAYS: ScheduleDay[] = ["19/10", "20/10", "21/10", "22/10", "23/10"].map((date, index) => ({
  id: `dia-${index + 1}`,
  label: `Dia ${index + 1} — ${date}`,
  blocks: createDayBlocks(),
}));
