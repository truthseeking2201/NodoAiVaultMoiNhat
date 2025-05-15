import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import WithdrawForm from "./WithdrawForm";
import ClaimToken from "./ClaimToken";

import { showFormatNumber, getBalanceAmountForInput } from "@/lib/number";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  useEstWithdrawVault,
  useWithdrawVault,
} from "@/hooks/useWithdrawVault";
import { useMyAssets, useWallet } from "@/hooks";
import { NDLP } from "@/config/lp-config";
import { sleep } from "@/lib/utils";

import DataClaimType from "@/types/data-claim.types.d";
import LpType from "@/types/lp.type";

export default function WithdrawVaultSection() {
  const count = useRef<string>("0");
  const [balanceLp, setBalanceLp] = useState<number>(0);
  const [dataClaim, setDataClaim] = useState<DataClaimType>();
  const [lpData, setLpData] = useState<LpType>(NDLP);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  /**
   * HOOKS
   */
  const { openConnectWalletDialog } = useWallet();
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
  }, [address, lpData, configVault]);

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
                1 {lpData.lp_symbol} ≈ {showFormatNumber(amountEst.receive)}{" "}
                {lpData.token_symbol}
              </div>
            </div>

            {dataClaim && ready && (
              <ClaimToken
                data={dataClaim}
                onSuccess={onSuccessClaim}
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
