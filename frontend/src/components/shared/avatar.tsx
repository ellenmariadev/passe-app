import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  { bg: "bg-[hsl(var(--avatar-violet))]", fg: "text-[hsl(var(--avatar-violet-foreground))]" },
  { bg: "bg-[hsl(var(--avatar-pink))]", fg: "text-[hsl(var(--avatar-pink-foreground))]" },
  { bg: "bg-[hsl(var(--avatar-cyan))]", fg: "text-[hsl(var(--avatar-cyan-foreground))]" },
  { bg: "bg-[hsl(var(--avatar-teal))]", fg: "text-[hsl(var(--avatar-teal-foreground))]" },
  { bg: "bg-[hsl(var(--avatar-zinc))]", fg: "text-[hsl(var(--avatar-zinc-foreground))]" },
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const colorIndex = hashName(name) % AVATAR_COLORS.length;
  const { bg, fg } = AVATAR_COLORS[colorIndex];

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        bg,
        fg,
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
