import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { SelectRender } from "@/components/ui/select-render";
import { Info } from "lucide-react";
import { TableRender } from "@/components/ui/table-render";
import { PaginationRender } from "@/components/ui/pagination-render";
import { InputSearch } from "@/components/ui/input-search";
import { getMyReferral } from "@/apis/vault";
import debounce from "lodash/debounce";
import { truncateStringWithSeparator } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { showFormatNumber } from "@/lib/number";
import { COIN_TYPES_CONFIG } from "@/config/coin-config";
import {
  TIME_FILTER,
  TIME_FILTER_OPTIONS_REFERRAL,
} from "@/config/constants-types.ts";
import { isValidSuiAddress } from "@mysten/sui/utils";

interface MyReferralsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyReferralsDashboardModal({
  isOpen = false,
  onClose = () => {},
}: MyReferralsDashboardModalProps) {
  /**
   * DATA
   */
  const columns = [
    {
      title: "ADDRESS",
      classTitle: "w-3/6",
      dataIndex: "address",
      render: (value: any) => (
        <span className="gradient-3rd-underline">
          {truncateStringWithSeparator(value, 13, "...", 6)}
        </span>
      ),
    },
    {
      title: "DATE JOINED",
      classTitle: "w-2/6",
      dataIndex: "dateJoin",
      keySort: "dateSort",
      render: (value: any) => (
        <span className="font-mono	text-075">{formatDate(value)}</span>
      ),
    },
    {
      title: "DEPOSIT",
      classTitle: "w-1/6",
      dataIndex: "depositAmount",
      keySort: "depositSort",
      render: (value: any) => (
        <div className="flex items-center font-mono	text-white">
          <img
            src={COIN_TYPES_CONFIG.collateral_token.image_url}
            alt={COIN_TYPES_CONFIG.collateral_token.display_name}
            className="w-4 h-4 mr-1 flex-shrink-0"
          />
          {showFormatNumber(value || 0, 2, 2)}
        </div>
      ),
    },
  ];

  const defaultParamsRefer = {
    page: 1,
    limit: 10,
    address: "",
    timeSelect: TIME_FILTER.all,
    dateSort: "desc", //asc | desc
    depositSort: "desc", //asc | desc
  };

  const count = useRef<string>("");
  const [listRefer, setListRefer] = useState<any[]>([]);
  const [paramsRefer, setParamsRefer] = useState(defaultParamsRefer);
  const [totalRefer, setTotalRefer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);

  /**
   * HOOKS
   */
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address;

  /**
   * FUNCTION
   */

  const initData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("------paramsRefer", paramsRefer);
      const response: any = await getMyReferral(paramsRefer);
      console.log("-----response", response);
      // TODO
      const data = response?.list?.map((el, index) => {
        return {
          id: index,
          address: el?.vault_address,
          dateJoin: el?.time,
          depositAmount: (el?.tokens[1]?.price || 0) * 1000,
        };
      });
      console.log("-----data", data);
      setListRefer(data);
      setTotalRefer(response?.total || 0);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [address, paramsRefer]);

  const changeSort = useCallback(
    async (key) => {
      const _params = { ...paramsRefer };
      _params[key] = _params[key] == "desc" ? "asc" : "desc";
      setParamsRefer(_params);
    },
    [paramsRefer]
  );
  const handlePageChange = useCallback(
    (page) => {
      setParamsRefer({ ...paramsRefer, page: page });
    },
    [paramsRefer]
  );
  const handleSelectTimeChange = useCallback(
    (value) => {
      setParamsRefer({ ...paramsRefer, timeSelect: value, page: 1 });
    },
    [paramsRefer]
  );
  const handleChangeAddress = useCallback(
    (inputValue) => {
      const isAddress = isValidSuiAddress(inputValue);
      if (isAddress || (paramsRefer.address && inputValue == "")) {
        setParamsRefer({ ...paramsRefer, address: inputValue, page: 1 });
      }
      setIsInvalidAddress(inputValue && !isAddress);
    },
    [paramsRefer]
  );

  const debouncedChange = useMemo(() => {
    return debounce(initData, 500);
  }, [initData]);

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    if (count.current !== address && address && isOpen) {
      setTotalRefer(0);
      initData();
      count.current = address;
    } else {
      count.current = "";
    }
  }, [address, isOpen]);

  useEffect(() => {
    if (count.current) {
      debouncedChange(paramsRefer);
      return () => {
        debouncedChange.cancel();
      };
    }
  }, [paramsRefer, debouncedChange, count]);

  /**
   * RENDER
   */
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent
        className="md:max-w-[764px] !rounded-xl	bg-black"
        hideIconClose
      >
        <DialogHeader className="p-0 relative flex flex-row items-start justify-between	flex-wrap">
          <DialogTitle className="text-xl font-bold m-0">
            My Referral Dashboard
          </DialogTitle>
          <DialogDescription className="sr-only">
            My Referral Dashboard
          </DialogDescription>

          <div className="flex gap-3 w-2/3 !mt-0">
            <div className="ml-auto max-w-60">
              <InputSearch
                placeholder="Search address"
                onChange={handleChangeAddress}
                disabled={isLoading}
              />
              {isInvalidAddress && (
                <div className="text-red-error text-sm mt-1 flex items-center">
                  <Info
                    size={16}
                    className="mr-2"
                  />
                  Invalid address
                </div>
              )}
            </div>
            <SelectRender
              className="max-w-40"
              value={paramsRefer.timeSelect}
              options={TIME_FILTER_OPTIONS_REFERRAL}
              onChange={handleSelectTimeChange}
              disabled={isLoading}
            />
          </div>
        </DialogHeader>

        <TableRender
          data={listRefer}
          columns={columns}
          isLoading={isLoading}
          paramsSearch={paramsRefer}
          changeSort={changeSort}
        />
        {totalRefer > 0 && (
          <PaginationRender
            className="mt-6"
            current={paramsRefer.page}
            pageSize={paramsRefer.limit}
            total={totalRefer}
            handlePageChange={handlePageChange}
            disabled={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
