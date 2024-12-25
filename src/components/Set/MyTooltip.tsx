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
}

const MyTooltip: React.FC<MyTooltipProps> = ({ text, children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MyTooltip;
