import { ArrowDownAZ, CircleDot, Sparkles } from "lucide-react";
import type { MemberSortBy } from "../../lib/memberList";
import type { SortOption } from "../lists/SortSheet";

export const MEMBER_SORT_OPTIONS: SortOption<MemberSortBy>[] = [
  { value: "name", label: "Name", icon: <ArrowDownAZ size={17} strokeWidth={1.75} /> },
  { value: "innerCircle", label: "Inner Circle", icon: <CircleDot size={17} strokeWidth={1.75} /> },
  { value: "newest", label: "Newest members", icon: <Sparkles size={17} strokeWidth={1.75} /> },
];
