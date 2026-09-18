import { buttonVariables } from "@/lib/landing/derive";
import type { CmsButton as CmsButtonConfig } from "@/lib/landing/schema";
import { linkTargetProps, safeHref } from "@/lib/landing/urls";

const STYLE_CLASS = { filled: "button-lime", outline: "button-outline", ghost: "button-cms-ghost" } as const;

export function CmsButton({ button, className = "" }: { button: CmsButtonConfig; className?: string }) {
  if (!button.enabled || !button.label.trim()) return null;

  return (
    <a
      className={`button ${STYLE_CLASS[button.style]} ${className}`}
      href={safeHref(button.url)}
      style={buttonVariables(button)}
      {...linkTargetProps(button.newTab)}
    >
      {button.label}
    </a>
  );
}
