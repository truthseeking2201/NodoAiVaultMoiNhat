import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ClaimToken from "./ClaimToken";
import WithdrawForm from "./WithdrawForm";

import {
  useCurrentDepositVault,
  useGetDepositVaults,
  useMyAssets,
  useWallet,
} from "@/hooks";
import {
  useEstWithdrawVault,
  useWithdrawVault,
} from "@/hooks/useWithdrawVault";
import { getBalanceAmountForInput, showFormatNumber } from "@/lib/number";
import { sleep } from "@/lib/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";

import ConditionRenderer from "@/components/shared/ConditionRenderer";
import { COIN_TYPES_CONFIG, LP_TOKEN_CONFIG } from "@/config/coin-config";
import { useWhitelistWallet } from "@/hooks/useWhitelistWallet";
import DataClaimType from "@/types/data-claim.types.d";

export default function WithdrawVaultSection() {
  const count = useRef<string>("0");
  const [balanceLp, setBalanceLp] = useState<number>(0);
  const [dataClaim, setDataClaim] = useState<DataClaimType>();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const currentDepositVault = useCurrentDepositVault();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const lpData = useMemo(() => {
    const { metadata } = currentDepositVault;
    return {
      package_id: currentDepositVault.metadata.package_id,
      vault_config_id: metadata.vault_config_id,
      vault_id: currentDepositVault.vault_id,
      clock: "0x6",

      lp_coin_type: currentDepositVault.vault_lp_token,
      lp_symbol: "NDLP", // hardcode for now
      lp_decimals: currentDepositVault.vault_lp_token_decimals,
      lp_image: LP_TOKEN_CONFIG.image_url,
      is_token_only: true,

      token_coin_type: currentDepositVault.collateral_token,
      token_symbol: currentDepositVault.collateral_token_symbol,
      token_decimals: currentDepositVault.collateral_token_decimals,
      token_image: COIN_TYPES_CONFIG.collateral_token.image_url,
    };
  }, [currentDepositVault]);

  /**
   * HOOKS
   */
  const { openConnectWalletDialog } = useWallet();
  const { isWhitelisted } = useWhitelistWallet();
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount?.address;
  const address = currentAccount?.address;
  const { refreshBalance, assets } = useMyAssets();
  const { amountEst, configVault } = useEstWithdrawVault(1, lpData);
  const { getLatestRequestClaim } = useWithdrawVault();

  /**
   * FUNCTION
   */
  const initBalance = async () => {
    try {
      const lpasset = assets.find(
        (asset) => asset.coin_type === lpData.lp_coin_type
      );
      const balance_raw = lpasset?.raw_balance || 0;
      const balance = getBalanceAmountForInput(
        balance_raw,
        lpData.lp_decimals,
        2
      );
      setBalanceLp(balance);
    } catch (error) {
      setBalanceLp(0);
    }
  };

  const initDataClaim = async () => {
    try {
      const res = await getLatestRequestClaim(address, lpData, configVault);
      setDataClaim(res);
      return res;
    } catch (error) {
      setDataClaim(null);
    }
  };

  const onSuccessWithdraw = async () => {
    setLoading(true);
    refreshBalance();
    refetchDepositVaults();
    for (let index = 0; index < 10; index++) {
      await sleep(2000);
      const res = await initDataClaim();
      if (res) break;
    }
    setLoading(false);
  };

  const onSuccessClaim = async () => {
    setLoading(true);
    refreshBalance();
    for (let index = 0; index < 10; index++) {
      await sleep(2000);
      const res = await initDataClaim();
      if (!res) break;
    }
    setLoading(false);
  };

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    const init = async () => {
      await initDataClaim();
      await sleep(300);
      setReady(true);
      setLoading(false);
    };
    init();
  }, [address, configVault]);

  useEffect(() => {
    initBalance();
  }, [assets]);

  /**
   * RENDER
   */
  return (
    <Spinner loading={loading}>
      <div className="p-6 bg-black rounded-b-2xl rounded-tr-2xl">
        {!isConnected && (
          <div>
            <p className="text-base text-white/60 text-center mb-5">
              Connect Wallet First to see your Funds
            </p>
            <Button
              variant="primary"
              size="xl"
              onClick={openConnectWalletDialog}
              className="w-full font-semibold text-lg"
            >
              <span>Connect Wallet</span>
              <ArrowRight
                size={16}
                className="ml-2"
              />
            </Button>
          </div>
        )}

        {isConnected && (
          <div>
            {/* Balance */}
            <div className="mb-9">
              <div className="font-sans text-base text-zinc-400 mb-3">
                Total Balance
              </div>
              <div className="flex items-center">
                <img
                  src={lpData.lp_image}
                  alt="NODOAIx Token"
                  className="w-[36px] h-[36px]"
                />
                <div className="text-white font-mono font-medium text-[40px] leading-[40px] ml-2">
                  {showFormatNumber(balanceLp)}
                </div>
              </div>
              <div className="font-sans text-sm text-white/60 mt-3">
                1 {lpData.lp_symbol} ≈ {showFormatNumber(amountEst?.receive)}{" "}
                {lpData.token_symbol}
              </div>
            </div>

            {dataClaim && ready && (
              <ClaimToken
                data={dataClaim}
                onSuccess={onSuccessClaim}
                reloadData={initDataClaim}
              />
            )}

            {!dataClaim && ready && (
              <WithdrawForm
                balanceLp={balanceLp}
                lpData={lpData}
                onSuccess={onSuccessWithdraw}
              />
            )}
          </div>
        )}
      </div>
    </Spinner>
  );
}
