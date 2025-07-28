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
  title?: string | ReactNode;
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
  headerClassName?: string;
  onRowClick?: (el: any) => void;
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
  headerClassName = "",
  onRowClick = () => {},
}: TableRenderProps) {
  /**
   * RENDER
   */
  return (
    <Table className="w-full">
      <TableHeader className={headerClassName}>
        <TableRow className=" hover:bg-transparent">
          {columns.map((el, index) => (
            <TableHead
              key={`head-${index}`}
              className={cn(
                "text-xs tracking-wide text-075 px-6",
                el?.classTitle,
                el.keySort ? "cursor-pointer" : ""
              )}
              onClick={() => {
                if (el.keySort) {
                  changeSort(el.keySort);
                }
              }}
            >
              <div className={cn("flex items-center", el?.classTitle)}>
                <span className="text-base">{el.title}</span>
                {el.keySort && paramsSearch.key === el.keySort && (
                  <Button
                    variant="icon"
                    size="none"
                    className="ml-2"
                    disabled={isLoading}
                  >
                    {paramsSearch.value == SORT_TYPE.desc ? (
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
                    className={cn("px-6 py-3 h-[97px]", column?.classCell)}
                  >
                    <div
                      className={cn(
                        "h-5 bg-white/10 animate-pulse rounded",
                        column?.classCell
                      )}
                    ></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
        ) : !isLoading && data.length > 0 ? (
          data.map((el, index) => (
            <TableRow
              key={`index-${index}`}
              className={cn(
                "hover:bg-white/5 cursor-pointer font-medium",
                index !== data.length - 1 && "border-b border-white/10",
                classRowBody
              )}
              onClick={() => onRowClick?.(el)}
            >
              {columns.map((column, ydx) => (
                <TableCell
                  key={`${index}-cell-${ydx}`}
                  className={cn("px-6 py-3 h-[50.5px]", column?.classCell)}
                >
                  <div className={cn("flex items-center", column?.classCell)}>
                    {column.render
                      ? column.render(el[column.dataIndex], el)
                      : el[column.dataIndex]}
                  </div>
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
  );
}
