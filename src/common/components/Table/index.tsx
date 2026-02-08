import dayjs from 'dayjs'

import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableColumn {
  label: string
  source?: string
  render?: (row: Record<string, unknown>) => React.ReactNode
}

interface TableProps {
  columns: TableColumn[]
  data: Record<string, unknown>[]
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
              onClick={() => rowClick?.(row?.id as string | number | null | undefined | boolean)}
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
                        const val = row[col.source!]
                        if (typeof val === 'boolean') return val as React.ReactNode
                        if (val != null && dayjs(val as string | number | Date).isValid())
                          return dayjs(val as string | number | Date).format('DD-MM-YYYY')
                        return val as React.ReactNode
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
