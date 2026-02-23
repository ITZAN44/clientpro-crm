"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  meta?: any;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearch,
  pagination,
  meta,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    meta,
  });

  const handleSearchChange = (value: string) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir que el Enter recargue o borre el input
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="font-semibold text-stone-700 dark:text-stone-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors border-b border-stone-200 dark:border-stone-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-stone-900 dark:text-stone-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-stone-500 dark:text-stone-400">
                    <Search className="h-8 w-8 text-stone-300 dark:text-stone-600" />
                    <p>No se encontraron resultados</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-stone-600 dark:text-stone-400">
            Mostrando {data.length === 0 ? 0 : ((pagination.page - 1) * 10) + 1} - {Math.min(pagination.page * 10, pagination.total)} de {pagination.total} clientes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="gap-1 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-stone-600 dark:text-stone-400">Página</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {pagination.page}
              </span>
              <span className="text-stone-600 dark:text-stone-400">de</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="gap-1 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
