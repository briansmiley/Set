import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MyTooltipProps {
  text: string;
  children: React.ReactNode;
  defaultCursor?: boolean;
}

const MyTooltip: React.FC<MyTooltipProps> = ({
  text,
  children,
  defaultCursor = false,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={defaultCursor ? "cursor-default" : ""}>
          {children}
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MyTooltip;
