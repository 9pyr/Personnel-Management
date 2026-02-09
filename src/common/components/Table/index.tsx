import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import * as React from 'react'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

type TableCellValue = string | number | boolean | null | Date | React.ReactNode

export interface TableRowData {
  id?: string | number | null | boolean
  [key: string]: TableCellValue | undefined
}

function isDateLike(val: TableCellValue): val is string | number | Date {
  return typeof val === 'string' || typeof val === 'number' || val instanceof Date
}

/** แปลงเป็น วัน เดือน ปี (ไทย) เช่น 9 กุมภาพันธ์ 2026 */
function formatDateDayMonthYear(val: string | number | Date): string {
  const s = typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) ? val.slice(0, 10) : val
  const d = dayjs(s)
  if (!d.isValid()) return String(val)
  return d.locale('th').format('D MMMM YYYY')
}

function toReactNode(val: TableCellValue): React.ReactNode {
  if (val === null || val === undefined) {
    return null
  }

  if (React.isValidElement(val)) {
    return val
  }

  if (typeof val === 'boolean') {
    return val ? 'true' : 'false'
  }

  if (isDateLike(val) && dayjs(val).isValid()) {
    return formatDateDayMonthYear(val)
  }

  // ที่เหลือจะเป็น string | number | ReactNode (ไม่ใช่ Date แล้ว)
  return typeof val === 'string' || typeof val === 'number' ? val : String(val)
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
    <div className="w-full overflow-auto rounded-md border border-border bg-card">
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
