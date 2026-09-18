"use client";

import { newId } from "@/components/admin/landing/helpers";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { SortableList } from "@/components/admin/ui/SortableList";
import { DUPLICABLE_SECTIONS, type LandingConfig, type LandingSection, SECTION_LABELS } from "@/lib/landing/schema";

type LandingSidebarProps = {
  config: LandingConfig;
  onSectionsChange: (sections: LandingSection[]) => void;
  onEdit: (target: string) => void;
};

function sectionLabel(section: LandingSection, sections: LandingSection[]): string {
  const sameType = sections.filter((item) => item.type === section.type);
  if (sameType.length < 2) return SECTION_LABELS[section.type];
  return `${SECTION_LABELS[section.type]} ${sameType.indexOf(section) + 1}`;
}

/** Lista de seções: editar, mostrar/ocultar, duplicar e reordenar. Header e Footer têm posição fixa. */
export function LandingSidebar({ config, onSectionsChange, onEdit }: LandingSidebarProps) {
  const { confirm } = useFeedback();
  const { sections } = config;

  const toggle = (id: string) => onSectionsChange(sections.map((section) => (section.id === id ? { ...section, enabled: !section.enabled } : section)));

  function duplicate(section: LandingSection) {
    const index = sections.indexOf(section);
    const copy = { ...structuredClone(section), id: newId(section.type) };
    onSectionsChange([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)]);
  }

  async function remove(section: LandingSection) {
    const confirmed = await confirm({
      title: "Excluir seção?",
      description: `"${sectionLabel(section, sections)}" será removida da página.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) onSectionsChange(sections.filter((item) => item.id !== section.id));
  }

  return (
    <div className="adm-sections">
      <div className="adm-section-row adm-section-fixed">
        <span className="adm-sortable-handle" aria-hidden="true" title="Sempre no topo">
          •
        </span>
        <strong>Header</strong>
        <em>sempre no topo</em>
        <button type="button" className="adm-btn adm-btn-small" onClick={() => onEdit("header")}>
          Editar
        </button>
      </div>

      <SortableList
        label="Seções da landing page"
        items={sections}
        onReorder={onSectionsChange}
        renderItem={(section) => {
          const canDuplicate = DUPLICABLE_SECTIONS.includes(section.type);
          const canRemove = canDuplicate && sections.filter((item) => item.type === section.type).length > 1;

          return (
            <div className="adm-section-row" data-disabled={!section.enabled}>
              <strong>{sectionLabel(section, sections)}</strong>
              <div className="adm-section-actions">
                <label className="adm-switch" title={section.enabled ? "Visível no site" : "Oculta no site"}>
                  <input type="checkbox" role="switch" checked={section.enabled} aria-label={`Mostrar ${sectionLabel(section, sections)}`} onChange={() => toggle(section.id)} />
                  <span aria-hidden="true" />
                </label>
                {canDuplicate && (
                  <button type="button" className="adm-btn adm-btn-small" onClick={() => duplicate(section)}>
                    Duplicar
                  </button>
                )}
                {canRemove && (
                  <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => remove(section)}>
                    Excluir
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn-small adm-btn-primary" onClick={() => onEdit(section.id)}>
                  Editar
                </button>
              </div>
            </div>
          );
        }}
      />

      <div className="adm-section-row adm-section-fixed">
        <span className="adm-sortable-handle" aria-hidden="true" title="Sempre no final">
          •
        </span>
        <strong>Footer</strong>
        <em>sempre no final</em>
        <button type="button" className="adm-btn adm-btn-small" onClick={() => onEdit("footer")}>
          Editar
        </button>
      </div>
    </div>
  );
}

export { sectionLabel };
