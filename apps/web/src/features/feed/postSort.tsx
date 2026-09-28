import { CalendarClock, Heart, MessageCircle, Sparkles } from "lucide-react";
import type { SortBy } from "../../lib/feed";
import type { SortOption } from "../lists/SortSheet";

export const POST_SORT_OPTIONS: SortOption<SortBy>[] = [
  { value: "newest", label: "Newest", icon: <Sparkles size={17} strokeWidth={1.75} /> },
  { value: "soonest", label: "Soonest", icon: <CalendarClock size={17} strokeWidth={1.75} /> },
  { value: "reactions", label: "Most reactions", icon: <Heart size={17} strokeWidth={1.75} /> },
  { value: "comments", label: "Most comments", icon: <MessageCircle size={17} strokeWidth={1.75} /> },
];
