import { Menu, InfoIcon, CircleHelpIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MenuSettings, MenuSettingsUpdate } from "@/lib/types";
import { Switch } from "../ui/switch";
import { ThemeToggle } from "../theme-toggle";

interface SetMenuProps {
  settings: MenuSettings;
  onSettingsChange: (update: MenuSettingsUpdate) => void;
}

interface SettingRowProps {
  label: string;
  info?: React.ReactNode;
  children?: React.ReactNode;
}

function SettingRow({ label, info, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {info && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <InfoIcon className="h-4 w-4" />
                <span className="sr-only">About {label}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">{info}</PopoverContent>
          </Popover>
        )}
      </div>
      {children}
    </div>
  );
}

export function SetMenu({ settings, onSettingsChange }: SetMenuProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <SettingRow
            label="Deck Mode"
            info={
              <p className="text-sm">
                <ul className="list-disc space-y-1 pl-4">
                  <li className="pl-1">
                    <span className="font-medium">Single Deck:</span> Play
                    through one 81-card deck
                  </li>
                  <li className="pl-1">
                    <span className="font-medium">Infinite:</span> Cycle forever
                    resetting deck when empty
                  </li>
                </ul>
              </p>
            }
          >
            <Select
              value={settings.deckMode}
              onValueChange={(value) =>
                onSettingsChange({
                  deckMode: value as MenuSettings["deckMode"],
                })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select deck mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soloDeck">Single Deck</SelectItem>
                <SelectItem value="soloInfinite">Infinite</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="No Sets"
            info={
              <div className="space-y-2 text-sm">
                <p>When no sets are on the board:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li className="pl-1">
                    <span className="font-medium">Auto:</span> Automatically add
                    3 new cards
                  </li>
                  <li className="pl-1">
                    <span className="font-medium">Nudge:</span> Pulse the add
                    cards button
                  </li>
                  <li className="pl-1">
                    <span className="font-medium">Do Nothing:</span> Do nothing;
                    figure it out yourself
                  </li>
                </ul>
                <p className="text-muted-foreground text-xs">
                  (clicking the add button will always add 3 cards, up to 21)
                </p>
              </div>
            }
          >
            <Select
              value={settings.handleNoSets}
              onValueChange={(value) =>
                onSettingsChange({
                  handleNoSets: value as MenuSettings["handleNoSets"],
                })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select behavior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autoAdd">Auto</SelectItem>
                <SelectItem value="hint">Nudge</SelectItem>
                <SelectItem value="none">Do Nothing</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            label="Sticky Set Count"
            info={
              <p className="text-muted-foreground text-sm">
                Keep board set counter ({" "}
                <CircleHelpIcon className="inline-block h-4 w-4" /> ) visible
                after claiming a set
              </p>
            }
          >
            <Switch
              checked={settings.stickySetCount}
              onCheckedChange={(checked) =>
                onSettingsChange({ stickySetCount: checked })
              }
            />
          </SettingRow>
          <div className="flex w-full justify-center">
            <ThemeToggle />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
