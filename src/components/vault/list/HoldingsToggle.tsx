import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HOLDING_TYPE = [
  {
    label: "Token",
    value: "token",
  },
  {
    label: "USD",
    value: "usd",
  },
];

export function HoldingsToggle() {
  return (
    <Tabs value={"token"}>
      <TabsList className="p-1 flex gap-1">
        {HOLDING_TYPE.map((tab, index) => (
          <TabsTrigger
            key={`holding-type-${index}`}
            value={tab.value}
            className="!text-xs"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
