import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import clsx from "clsx";

export type VaultOption = {
  id: string;
  pair: string;             // "USDC/SUI"
  name?: string;            // "NODO AI — USDC/SUI"
  dex: string;              // "Cetus"
  chain: string;            // "SUI"
  utilization?: number;     // 0..1
  tokenIcons?: { base?: string; quote?: string }; // URLs (optional)
};

type Props = {
  currentVaultId: string;
  vaults: VaultOption[];
  onSwitch?: (id: string) => void; // non-Next apps can use this
  className?: string;
};

export function VaultSwitcher({
  currentVaultId,
  vaults,
  onSwitch,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return vaults;
    return vaults.filter((v) => {
      const s = `${v.name ?? ""} ${v.pair} ${v.dex} ${v.chain}`.toLowerCase();
      return s.includes(q);
    });
  }, [query, vaults]);

  function handleSelect(id: string) {
    setOpen(false);
    if (onSwitch) return onSwitch(id);
    if (typeof window !== "undefined") {
      window.location.href = `/vaults/${id}`;
    }
  }

  const current = vaults.find((v) => v.id === currentVaultId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "h-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10",
            "text-white/90 gap-1 px-3",
            className
          )}
        >
          Switch vault <ChevronDown className="w-4 h-4 opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={clsx(
          "w-[360px] p-0 rounded-2xl border-white/10 bg-[#121317] text-white",
          "shadow-xl"
        )}
      >
        <Command className="bg-transparent">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/10">
              <Search className="w-4 h-4 text-white/60" />
              <CommandInput
                placeholder="Search vaults…"
                value={query}
                onValueChange={setQuery}
                className="placeholder:text-white/40 text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <CommandList className="max-h-[360px]">
            <CommandEmpty className="px-4 py-6 text-sm text-white/60">
              No vaults found
            </CommandEmpty>

            <CommandGroup heading="All vaults" className="text-white/60">
              {filtered.map((v) => (
                <CommandItem
                  key={v.id}
                  value={v.id}
                  onSelect={() => handleSelect(v.id)}
                  className={clsx(
                    "px-3 py-2.5 rounded-xl my-1 cursor-pointer",
                    "aria-selected:bg-white/10 data-[selected=true]:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <TokenPairIcon icons={v.tokenIcons} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-white/90">
                          {v.name ?? v.pair}
                        </div>
                        {v.id === currentVaultId && (
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-200 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-2 py-0.5">
                            <Check className="w-3 h-3" /> Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <Chip>{v.dex}</Chip>
                        <Chip tone="neutral">{v.chain}</Chip>
                      </div>
                    </div>

                    {typeof v.utilization === "number" && (
                      <div className="text-xs text-white/50 tabular-nums">
                        {(v.utilization * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Small helper components to keep style consistent */
function Chip({
  children,
  tone = "brand",
}: React.PropsWithChildren<{ tone?: "brand" | "neutral" }>) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full border text-[11px]",
        tone === "brand"
          ? "bg-white/5 border-white/10 text-white/70"
          : "bg-white/5 border-white/10 text-white/60"
      )}
    >
      {children}
    </span>
  );
}

function TokenPairIcon({
  icons,
}: {
  icons?: { base?: string; quote?: string };
}) {
  // Fallback circles if icons missing
  return (
    <div className="relative w-8 h-8">
      <div className="absolute -left-0 top-0 w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden">
        {icons?.base ? (
          <img src={icons.base} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="absolute -right-1 bottom-0 w-6 h-6 rounded-full bg-white/10 border border-white/10 overflow-hidden">
        {icons?.quote ? (
          <img
            src={icons.quote}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
