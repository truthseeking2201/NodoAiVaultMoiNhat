import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  METHOD_DEPOSIT_TABS,
  METHOD_DEPOSIT,
} from "@/components/vault-detail/constant";
import { cn } from "@/lib/utils";
import NewTag from "@/components/ui/new-tag";

type Props = {
  className?: string;
  value: string;
  onChange: (value) => void;
  isEnableDual?: boolean;
};

const SelectMethod = ({
  value,
  className,
  onChange,
  isEnableDual = true,
}: Props) => {
  const tabs = useMemo(() => {
    if (isEnableDual) return METHOD_DEPOSIT_TABS;
    return METHOD_DEPOSIT_TABS.filter((i) => i.value !== METHOD_DEPOSIT.DUAL);
  }, [isEnableDual]);

  return (
    <Tabs
      value={value}
      onValueChange={onChange}
      className={cn("mb-4", className)}
    >
      <TabsList className="p-1 flex gap-1 ">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.value == METHOD_DEPOSIT.DUAL && <NewTag text="NEW" />}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default SelectMethod;
