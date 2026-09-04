'use client'

import React, { useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Portfolio } from '@/app/util/InvestmentUtil'

type PortfolioTableProps = {
  data: Portfolio[]
  onDeleteHolding?: (holding: Portfolio) => void | Promise<void>
  deletingId?: string | null
}

export function PortfolioTable({
  data,
  onDeleteHolding,
  deletingId = null,
}: PortfolioTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = useMemo<ColumnDef<Portfolio>[]>(() => {
    const base: ColumnDef<Portfolio>[] = [
      {
        accessorKey: 'schemeName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Scheme Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/portfolio/${row.original.schemeCode || row.original.id}`}
            className="text-primary hover:underline"
          >
            {row.getValue('schemeName')}
          </Link>
        ),
      },
      { accessorKey: 'amcName', header: 'AMC Name' },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'units',
        header: 'Units',
        cell: ({ row }) => (
          <div className="text-right">{parseFloat(row.getValue('units')).toFixed(2)}</div>
        ),
      },
      {
        accessorKey: 'investedValue',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Invested Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('investedValue'))
          return (
            <div className="text-right font-medium">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(amount)}
            </div>
          )
        },
      },
      {
        accessorKey: 'currentValue',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Current Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('currentValue'))
          return (
            <div className="text-right font-medium">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(amount)}
            </div>
          )
        },
      },
      {
        id: 'gainLoss',
        accessorFn: (row) => row.currentValue - row.investedValue,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Gain/Loss
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const investedValue = row.original.investedValue
          const currentValue = row.original.currentValue
          const gainLoss = currentValue - investedValue
          const percentage = investedValue ? (gainLoss / investedValue) * 100 : 0
          const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(gainLoss)
          return (
            <div
              className={`text-right font-medium ${
                gainLoss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatted} ({percentage.toFixed(2)}%)
            </div>
          )
        },
      },
    ]

    if (onDeleteHolding) {
      base.push({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={deletingId === row.original.id}
              onClick={() => onDeleteHolding(row.original)}
              aria-label={`Delete ${row.original.schemeName}`}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      })
    }

    return base
  }, [onDeleteHolding, deletingId])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
