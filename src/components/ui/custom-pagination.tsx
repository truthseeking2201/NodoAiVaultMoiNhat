import {
  ChevronLast,
  ChevronFirst,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const gradientActive =
  "relative inline-flex p-[0.5px] rounded-lg bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-60% to-[#C9D4FF]";

export const CustomPagination = ({
  itemsPerPage,
  totalItems,
  currentPage,
  handlePageChange,
  displayTotalPages = Math.ceil(totalItems / itemsPerPage),
  isShowingTotalPages = true,
}) => {
  return (
    <div className="flex justify-between items-center mt-4">
      {isShowingTotalPages && (
        <div className="text-white text-xs">
          Showing {itemsPerPage * (currentPage - 1) + 1}-
          {Math.min(itemsPerPage * currentPage, totalItems)} of {totalItems}{" "}
          activities
        </div>
      )}

      <div className="flex justify-end items-center gap-2">
        <Button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronFirst className="!w-4 !h-4" />
        </Button>
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronLeft className="!w-4 !h-4" />
        </Button>
        <div className="flex space-x-2">
          {displayTotalPages === 0 ? (
            <div className={gradientActive}>
              <Button
                key={1}
                onClick={() => handlePageChange(1)}
                variant="pagination-active"
                size="pagination"
              >
                1
              </Button>
            </div>
          ) : displayTotalPages <= 5 ? (
            Array.from({ length: displayTotalPages }, (_, i) => (
              <div
                key={i + 1}
                className={cn(currentPage === i + 1 ? gradientActive : "")}
              >
                <Button
                  onClick={() => handlePageChange(i + 1)}
                  variant={
                    currentPage === i + 1
                      ? "pagination-active"
                      : "pagination-default"
                  }
                  size="pagination"
                >
                  {i + 1}
                </Button>
              </div>
            ))
          ) : (
            <>
              {currentPage <= 3 ? (
                <>
                  {[1, 2, 3, 4, 5]
                    .filter((page) => page <= displayTotalPages)
                    .map((page) => (
                      <div
                        className={cn(
                          currentPage === page ? gradientActive : ""
                        )}
                        key={page}
                      >
                        <Button
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "pagination-active"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                  {displayTotalPages > 5 && (
                    <span className="px-2 text-white/60 select-none">...</span>
                  )}
                </>
              ) : currentPage >= displayTotalPages - 2 ? (
                <>
                  <span className="px-2 text-white/60 select-none">...</span>
                  {Array.from(
                    { length: 5 },
                    (_, i) => displayTotalPages - 4 + i
                  )
                    .filter((page) => page >= 1 && page <= displayTotalPages)
                    .map((page) => (
                      <div
                        className={cn(
                          currentPage === page ? gradientActive : ""
                        )}
                        key={page}
                      >
                        <Button
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "pagination-active"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </>
              ) : (
                <>
                  <span className="px-2 text-white/60 select-none">...</span>
                  {[currentPage - 1, currentPage, currentPage + 1]
                    .filter((page) => page >= 1 && page <= displayTotalPages)
                    .map((page) => (
                      <div
                        className={cn(
                          currentPage === page ? gradientActive : ""
                        )}
                        key={page}
                      >
                        <Button
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "pagination-active"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                  <span className="px-2 text-white/60 select-none">...</span>
                </>
              )}
            </>
          )}
        </div>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === displayTotalPages}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronRight className="!w-4 !h-4" />
        </Button>
        <Button
          onClick={() => handlePageChange(displayTotalPages)}
          disabled={currentPage === displayTotalPages}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronLast className="!w-4 !h-4" />
        </Button>
      </div>
    </div>
  );
};
