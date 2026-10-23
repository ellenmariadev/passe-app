import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  header: ReactNode;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
  onRowClick,
  skeletonRows = 8,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, columnIndex) => (
                <TableCell key={columnIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={getRowKey(row)}
            className={cn(onRowClick && "cursor-pointer")}
            onClick={
              onRowClick
                ? (event) => {
                    const target = event.target as HTMLElement;
                    if (
                      target.closest(
                        "button, a, input, select, textarea, [data-no-row-click]",
                      )
                    ) {
                      return;
                    }
                    onRowClick(row);
                  }
                : undefined
            }
          >
            {columns.map((column, index) => (
              <TableCell key={index} className={column.className}>
                {column.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
