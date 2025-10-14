import { GradientSelect } from "@/components/ui/gradient-select";
import { InputSearch } from "@/components/ui/input-search";

const OPTIONS_CHAINS = [
  { value: "all", label: "All Chains" },
  {
    value: "sui",
    label: "SUI",
    icon: <img src="/chains/sui.png" alt="SUI" className="w-5 h-5" />,
  },
  {
    value: "bsc",
    label: "BSC",
    disabled: true,
    icon: <img src="/chains/bsc.png" alt="BSC" className="w-5 h-5" />,
    left: (
      <div
        className="text-white text-[10px] px-2"
        style={{
          borderRadius: "90px",
          border: "0.5px solid #FFE8C9",
        }}
      >
        Coming Soon
      </div>
    ),
  },
];

const FilterDropdown = ({ label, className }) => {
  return (
    <GradientSelect
      options={OPTIONS_CHAINS}
      placeholder={label}
      value={[]}
      onChange={() => {}}
      className={className}
    />
  );
};

const SearchInput = ({ placeholder, className }) => {
  return (
    <InputSearch
      className={className}
      placeholder={placeholder}
      onChange={() => {}}
      debounceTime={300}
    />
  );
};

export function LiveVaultsToolbar() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Search */}
      <div className="w-full max-w-[460px]">
        <SearchInput className="h-10 rounded-xl bg-white/5 border border-white/10" placeholder="Search AI vaults..." />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <FilterDropdown label="All Chains" className="h-10 rounded-xl bg-white/5 border border-white/10" />
        <FilterDropdown label="All DEXs"   className="h-10 rounded-xl bg-white/5 border border-white/10" />
      </div>
    </div>
  );
}
