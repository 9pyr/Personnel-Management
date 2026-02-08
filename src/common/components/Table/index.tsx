import dayjs from 'dayjs'
import * as React from 'react'

import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TableCellValue =
  | string
  | number
  | boolean
  | null
  | Date
  | React.ReactNode

export interface TableRowData {
  id?: string | number | null | boolean
  [key: string]: TableCellValue | undefined
}

function isDateLike(val: TableCellValue): val is string | number | Date {
  return typeof val === 'string' || typeof val === 'number' || val instanceof Date
}

function toReactNode(val: TableCellValue): React.ReactNode {
  if (val === null || val === undefined) return val
  if (typeof val === 'boolean' || typeof val === 'object' && '$$typeof' in val) return val
  if (isDateLike(val) && dayjs(val).isValid()) return dayjs(val).format('DD-MM-YYYY')
  return val
}

interface TableColumn {
  label: string
  source?: string
  render?: (row: TableRowData) => React.ReactNode
}

interface TableProps {
  columns: TableColumn[]
  data: TableRowData[]
  rowClick: (id: string | number | null | undefined | boolean) => void
}

const Table = ({ columns, data, rowClick }: TableProps) => {
  return (
    <div className="w-full overflow-auto rounded-md border border-border">
      <BaseTable>
        <TableHeader>
          <TableRow>
            {columns.map(({ label }, index) => (
              <TableHead key={`table-head-row:${index}`}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={`table-body-row:${index}`}
              className="cursor-pointer"
              onClick={() => rowClick?.(row?.id)}
            >
              {columns.map((col, colIndex) => (
                <TableCell
                  key={`table-body-row-cell:${index}-${colIndex}`}
                  className={col.render ? '' : 'cursor-pointer'}
                  onClick={col.render ? e => e.stopPropagation() : undefined}
                >
                  {col.render
                    ? col.render(row)
                    : (() => {
                        const val = col.source ? row[col.source] : undefined
                        return toReactNode(val ?? null)
                      })()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </BaseTable>
    </div>
  )
}

export default Table
