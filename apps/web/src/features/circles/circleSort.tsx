import { ArrowDownAZ, Sparkles, Users } from "lucide-react";
import type { CircleSortBy } from "../../lib/circleList";
import type { SortOption } from "../lists/SortSheet";

export const CIRCLE_SORT_OPTIONS: SortOption<CircleSortBy>[] = [
  { value: "name", label: "Name", icon: <ArrowDownAZ size={17} strokeWidth={1.75} /> },
  { value: "members", label: "Most members", icon: <Users size={17} strokeWidth={1.75} /> },
  { value: "newest", label: "Newest", icon: <Sparkles size={17} strokeWidth={1.75} /> },
];
