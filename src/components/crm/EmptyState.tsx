import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function EmptyState({
  icon, title, description, action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
        {icon ?? <Sparkles className="size-5" />}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
