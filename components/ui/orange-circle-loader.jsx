import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-4",
};

export function OrangeCircleLoader({ size = "md", className }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-[#f26b5b]/30 border-t-[#f26b5b]",
        sizeClass,
        className,
      )}
    />
  );
}
