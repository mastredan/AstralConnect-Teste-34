import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <Card className={cn("glass-effect shadow-2xl", className)}>
      {children}
    </Card>
  );
}
