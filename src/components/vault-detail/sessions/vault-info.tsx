import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { truncateBetween } from "@/utils/truncate";
import { Copy } from "@/assets/icons";
import { useToast } from "@/hooks/use-toast";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

const VaultInfo = ({
  vaultDetails,
  isDetailLoading,
}: {
  vaultDetails: BasicVaultDetailsType;
  isDetailLoading: boolean;
}) => {
  const { toast } = useToast();

  const handleCheckAddress = (address: any) => {
    window.open(`https://suiscan.xyz/mainnet/object/${address}`, "_blank");
  };

  const handleCopy = (e: any, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    toast({
      variant: "success",
      title: "Address copied",
      description: "Address copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <DetailWrapper
      title="Vault Information"
      isLoading={isDetailLoading}
      loadingStyle="h-[190px] w-full"
    >
      <div>
        <div className="text-white text-md font-medium">NODO Platform Fees</div>
        <div className="flex items-center gap-12 mt-4">
          <div>
            <div className="text-[#9CA3AF] text-xs pb-1">Management Fee</div>
            <div className="text-white text-sm font-mono">
              {(vaultDetails?.management_fee || 0).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[#9CA3AF] text-xs pb-1">
              Performance Fee (From fees and rewards)
            </div>
            <div className="text-white font-mono text-sm">
              {(vaultDetails?.performance_fee || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 mb-6 h-[1px] border-t border-white-200" />
      <div>
        <div className="text-white text-md font-medium">Contracts</div>
        <div className="flex items-center gap-12 mt-4">
          <div>
            <div className="text-[#9CA3AF] text-xs pb-1">
              Vault Contract Address
            </div>
            <div
              className="text-white hover:cursor-pointer hover:underline text-sm font-mono"
              onClick={() =>
                handleCheckAddress(vaultDetails?.vault_address)
              }
            >
              {truncateBetween(vaultDetails?.vault_address || "", 6, 6)}
              <Copy
                className="inline-block ml-1 h-4 w-4 cursor-pointer"
                onClick={(e) => {
                  handleCopy(e, vaultDetails.vault_address || "");
                }}
              />
            </div>
          </div>
          <div>
            <div className="text-[#9CA3AF] text-xs pb-1">
              Liquidity Pool Address
            </div>
            <div
              className="text-white hover:cursor-pointer hover:underline text-sm font-mono"
              onClick={() => handleCheckAddress(vaultDetails?.pool?.pool_address)}
            >
              {truncateBetween(vaultDetails?.pool?.pool_address || "", 6, 6)}
              <Copy
                className="inline-block ml-1 h-4 w-4 cursor-pointer"
                onClick={(e) => {
                  handleCopy(e, vaultDetails?.pool?.pool_address || "");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </DetailWrapper>
  );
};

export default VaultInfo;
