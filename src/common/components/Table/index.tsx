import Paper from '@mui/material/Paper'
import BaseTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import dayjs from 'dayjs'

import { TableBodyTableRowSx } from './styles'

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
    <TableContainer component={Paper}>
      <BaseTable sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map(({ label }, index) => (
              <TableCell key={`table-head-row:${index}`}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={`table-body-row:${index}`}
              sx={TableBodyTableRowSx}
              onClick={() => rowClick?.(row?.id)}
              hover
            >
              {columns.map((col, colIndex) => (
                <TableCell
                  key={`table-body-row-cell:${index}-${colIndex}`}
                  className={col.render ? '' : 'cursor-pointer'}
                  onClick={col.render ? e => e.stopPropagation() : undefined}
                >
                  {col.render
                    ? col.render(row)
                    : typeof row[col.source!] !== 'boolean' && dayjs(row[col.source!]).isValid()
                      ? dayjs(row[col.source!]).format('DD-MM-YYYY')
                      : (row[col.source!] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </BaseTable>
    </TableContainer>
  )
}

export default Table
