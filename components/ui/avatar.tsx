import { cn } from "@/lib/cn";

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/**
 * Initials avatar with a deterministic per-name colour (a self-contained
 * coloured chip that reads on both light and dark surfaces).
 */
export function Avatar({
  name,
  initials,
  size = 32,
  className,
}: {
  name: string;
  /** Override the computed initials (colour still seeds from `name`). */
  initials?: string;
  size?: number;
  className?: string;
}) {
  const hue = hashString(name) % 360;
  return (
    <span
      aria-hidden
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 60% 88%)`,
        color: `hsl(${hue} 45% 32%)`,
      }}
    >
      {initials ?? initialsOf(name)}
    </span>
  );
}

/** Overlapping avatars with a "+N" overflow chip (e.g. board team faces). */
export function AvatarGroup({
  names,
  max = 4,
  size = 24,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const overlap = Math.round(size * 0.3);
  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="rounded-full ring-2 ring-surface"
          style={{ marginLeft: i === 0 ? 0 : -overlap }}
        >
          <Avatar name={name} size={size} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          className="inline-grid place-items-center rounded-full bg-sunken font-semibold text-secondary ring-2 ring-surface"
          style={{ width: size, height: size, fontSize: size * 0.36, marginLeft: -overlap }}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
