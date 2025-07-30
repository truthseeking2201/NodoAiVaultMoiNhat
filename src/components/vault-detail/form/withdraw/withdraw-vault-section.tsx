import Web3Button from "@/components/ui/web3-button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ClaimToken from "./claim-token";
import WithdrawForm from "./withdraw-form";

import {
  useGetDepositVaults,
  useGetLpToken,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import {
  useWithdrawVault,
  useWithdrawVaultConfig,
} from "@/hooks/use-withdraw-vault";
import { useUserAssetsStore } from "@/hooks";

import { sleep } from "@/lib/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CLOCK } from "@/config/vault-config";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import DataClaimType from "@/types/data-claim.types.d";

export default function WithdrawVaultSection({
  vault_id,
}: {
  vault_id: string;
}) {
  const [dataClaim, setDataClaim] = useState<DataClaimType>();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  /**
   * HOOKS
   */
  const { openConnectWalletDialog } = useWallet();
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount?.address;
  const address = currentAccount?.address;
  const { setRefetch: refreshBalance } = useUserAssetsStore();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();
  const { data: vault } = useVaultBasicDetails(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const lpData = useMemo(() => {
    const poolName = vault.pool.pool_name;
    const token1 = poolName.split("-")[0];
    const token2 = poolName.split("-")[1];
    const exchange = EXCHANGE_CODES_MAP[vault.exchange_id] || null;
    return {
      package_id: vault.metadata.package_id,
      vault_config_id: vault.metadata.vault_config_id,
      vault_id: vault.vault_id,
      clock: CLOCK,
      vault_name: vault.vault_name,

      lp_coin_type: vault.vault_lp_token,
      lp_symbol: lpToken?.display_name,
      lp_decimals: vault.vault_lp_token_decimals,
      lp_image: lpToken?.image_url,
      is_token_only: false,

      collateral_coin_type: vault.collateral_token,
      collateral_decimals: vault.collateral_token_decimals,

      token_coin_type: vault.pool?.token_a_address,
      token_image: `/coins/${token1?.toLowerCase()}.png`,
      token_symbol: token1,

      quote_coin_type: vault.pool?.token_b_address,
      quote_image: `/coins/${token2?.toLowerCase()}.png`,
      quote_symbol: token2,
      exchange,
    };
  }, [vault, lpToken]);

  const tokens = useMemo(() => {
    const tmp = (vault as any)?.tokens || [];
    return tmp?.map((i) => {
      return {
        ...i,
        image: `/coins/${i?.token_symbol?.toLocaleLowerCase()}.png`,
      };
    });
  }, [vault]);

  const { configVault } = useWithdrawVaultConfig(lpData);
  const { getLatestRequestClaim } = useWithdrawVault();

  /**
   * FUNCTION
   */

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
    for (let index = 0; index < 10; index++) {
      await sleep(2000);
      const res = await initDataClaim();
      if (res) {
        refreshBalance();
        refetchDepositVaults();
        break;
      }
    }
    setLoading(false);
  };

  const onSuccessClaim = async () => {
    setLoading(true);
    await sleep(2000);
    const res = await initDataClaim();
    if (!res) {
      refreshBalance();
    }
    setLoading(false);
  };

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    const init = async () => {
      await initDataClaim();
      setReady(true);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, configVault]);

  /**
   * RENDER
   */
  return (
    <Spinner loading={loading}>
      <div>
        {!isConnected && (
          <div>
            <Web3Button
              onClick={openConnectWalletDialog}
              className="flex items-center justify-center w-full font-semibold text-lg py-3"
            >
              <span>Connect Wallet</span>
              <ArrowRight
                size={16}
                className="ml-2"
              />
            </Web3Button>
          </div>
        )}

        {!ready && <div className="min-h-[300px]"></div>}

        {isConnected && (
          <>
            {dataClaim && ready && (
              <ClaimToken
                balanceLp={lpToken?.balance || "0"}
                data={dataClaim}
                onSuccess={onSuccessClaim}
                reloadData={initDataClaim}
              />
            )}

            {!dataClaim && ready && (
              <WithdrawForm
                balanceLp={lpToken?.balance || "0"}
                lpData={lpData}
                tokens={tokens}
                onSuccess={onSuccessWithdraw}
              />
            )}
          </>
        )}
      </div>
    </Spinner>
  );
}
