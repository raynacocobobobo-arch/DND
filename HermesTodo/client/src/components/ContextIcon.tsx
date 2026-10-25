import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Dumbbell,
  Film,
  Folder,
  Heart,
  Home,
  Luggage,
  Plane,
  ShoppingBag,
  Sparkles,
  type LucideIcon
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  dumbbell: Dumbbell,
  film: Film,
  folder: Folder,
  heart: Heart,
  home: Home,
  plane: Plane,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
  suitcase: Luggage
};

export function ContextIcon({ name, size = 21 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? Folder;
  return <Icon aria-hidden="true" size={size} strokeWidth={2.1} />;
}
