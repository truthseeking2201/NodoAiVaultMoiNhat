import { cn } from "@/lib/utils";

const NewTag = ({
  parentClassName,
  textClassName,
  text = "NEW",
}: {
  parentClassName?: string;
  textClassName?: string;
  text?: string;
}) => (
  <span
    className={cn(
      "glow-animation ml-2 text-10px md:text-xs font-bold px-2 py-0.5 font-sans rounded-[6px] bg-black new-glow",
      parentClassName
    )}
  >
    <span
      style={{
        background:
          "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #DDF7F1 60%, #B5F0FF 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      className={cn("animate-shine bg-[length:200%_100%]", textClassName)}
    >
      {text}
    </span>
  </span>
);

export default NewTag;
