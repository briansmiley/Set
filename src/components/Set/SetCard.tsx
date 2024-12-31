import type { SetCard } from "@/lib/types";

interface SetCardProps {
  card: SetCard;
  selected?: boolean;
  invalid?: boolean;
  size?: "xxs" | "xs" | "sm" | "md" | "lg";
  responsive?: boolean;
  width?: "responsive" | number;
  rotation?: number;
}

// Generate a human-readable description of the card
function getCardDescription(card: SetCard): string {
  const { shape, color, fill, number } = card;
  return `${number} ${fill} ${color} ${shape}${number > 1 ? "s" : ""}`;
}

export default function SetCard({
  card,
  selected = false,
  invalid = false,
  width = "responsive",
  rotation = 0,
}: SetCardProps) {
  const { shape, color, fill, number } = card;

  const selectedClasses = invalid
    ? "shadow-[0_0_36px_0px_hsl(var(--destructive))] border-destructive border-[3px]"
    : selected
      ? "shadow-[0_0_36px_0_theme(colors.blue.500)] border-blue-500 border-2"
      : rotation === 90
        ? "shadow-[2px_-2px_4px_0_hsl(var(--foreground)/5)] dark:shadow-[1px_-1px_2px_0_hsl(var(--foreground)/5)] border border-foreground"
        : "shadow-[2px_2px_4px_0_hsl(var(--foreground)/5)] dark:shadow-[1px_1px_2px_0_hsl(var(--foreground)/5)] border border-foreground";

  const getShape = (idx: number) => {
    return (
      <div key={idx} className="relative aspect-[1/2] h-[80%]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 30 60"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <defs>
            <pattern
              id={`stripe-${color}`}
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
            >
              <line
                x1="0"
                y1="3"
                x2="6"
                y2="3"
                stroke={color}
                strokeWidth="2"
              />
            </pattern>
          </defs>

          {shape === "diamond" && (
            <path
              d="M15 5 L27 30 L15 55 L3 30 Z"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="2"
            />
          )}
          {shape === "oval" && (
            <path
              d="M 5 18 v 24 a 10 10 0 0 0 20 0 v -24 a 10 10 0 0 0 -20 0"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
          {shape === "squiggle" && (
            <path
              d="M 4.37 11.5 C 4.37 8.74 5.75 6.44 8.05 4.6 C 11.73 2.3 16.79 3.22 19.55 6.9 c 5.98 8.74 7.82 18.4 2.76 27.6 c -1.84 3.22 -0.92 5.98 1.38 8.74 c 2.76 3.22 2.3 8.28 -0.92 11.5 c -3.22 2.76 -8.28 2.3 -11.5 -0.92 C 4.37 45.54 2.99 35.88 8.05 26.68 C 9.89 23 8.51 19.32 5.75 16.1 C 4.83 14.72 4.37 12.88 4.37 11.5 z"
              stroke={color}
              strokeWidth="2"
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`flex aspect-[5/3] items-center justify-center rounded-[8%] bg-white dark:bg-slate-900 ${selectedClasses}`}
      role="button"
      aria-label={getCardDescription(card)}
      tabIndex={0}
      style={{
        width: width === "responsive" ? "100%" : `${width}px`,
        transform: `rotate(${rotation}deg)`,
        transformBox: "fill-box",
      }}
    >
      {[...Array(number)].map((_, i) => getShape(i))}
    </div>
  );
}
