import type { Category } from "./types";

export const categoryStyle: Record<Category, { chip: string; dot: string; bar: string }> = {
  Work: {
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
  },
  Health: {
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Ideas: {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  Personal: {
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },
};
