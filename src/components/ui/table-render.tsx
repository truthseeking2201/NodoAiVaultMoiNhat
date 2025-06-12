import { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_TYPE } from "@/config/constants-types.ts";

interface ColumnsTable {
  title?: string;
  classTitle?: string;
  keySort?: string;
  dataIndex: string;
  classCell?: string;
  render?: (value?: any, record?: any) => ReactNode;
}

interface TableRenderProps {
  data: any[];
  columns: ColumnsTable[];
  labelNodata?: string;
  isLoading?: boolean;
  paramsSearch?: any;
  changeSort?: (key: string) => void;
  classRowBody?: string;
  numRowLoading?: number;
}

export function TableRender({
  data = [],
  columns = [],
  labelNodata = "No data",
  isLoading = false,
  paramsSearch = {},
  changeSort = () => {},
  classRowBody = "",
  numRowLoading = 5,
}: TableRenderProps) {
  /**
   * RENDER
   */
  return (
    <div className="overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className=" hover:bg-transparent">
              {columns.map((el, index) => (
                <TableHead
                  key={`head-${index}`}
                  className={cn(
                    "text-xs uppercase tracking-wide text-075 px-6",
                    el?.classTitle
                  )}
                >
                  <div className="flex items-center">
                    <span>{el.title}</span>
                    {el?.keySort && (
                      <Button
                        variant="icon"
                        size="none"
                        className="ml-2"
                        onClick={() => changeSort(el.keySort)}
                        disabled={isLoading}
                      >
                        {paramsSearch[el.keySort] == SORT_TYPE.desc ? (
                          <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(data?.length || numRowLoading)
                .fill(0)
                .map((_, i) => (
                  <TableRow
                    key={i}
                    className={cn(
                      "hover:bg-white/5 font-medium border-b border-white/10",
                      classRowBody
                    )}
                  >
                    {columns.map((column, index) => (
                      <TableCell
                        key={`loading-${index}`}
                        className={cn(
                          "px-6 py-3 h-[50.5px]",
                          column?.classCell
                        )}
                      >
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : !isLoading && data.length > 0 ? (
              data.map((el, index) => (
                <TableRow
                  key={`index-${index}`}
                  className={cn(
                    "hover:bg-white/5 cursor-pointer font-medium border-b border-white/10",
                    classRowBody
                  )}
                >
                  {columns.map((column, ydx) => (
                    <TableCell
                      key={`${index}-cell-${ydx}`}
                      className={cn("px-6 py-3 h-[50.5px]", column?.classCell)}
                    >
                      {column.render
                        ? column.render(el[column.dataIndex], el)
                        : el[column.dataIndex]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-white/60 border-t border-white/10"
                >
                  {labelNodata}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
