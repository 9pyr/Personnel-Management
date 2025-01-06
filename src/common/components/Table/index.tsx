import Paper from '@mui/material/Paper'
import BaseTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import dayjs from 'dayjs'

import { TableBodyTableRowSx } from './styles'

interface TableProps {
  columns: {
    label: string
    source: string
  }[]
  data: {
    [key: string]: string | number | null | undefined | boolean
  }[]
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
              {columns.map(({ source }) => (
                <TableCell key={`table-body-row-cell:${index}`} className="cursor-pointer">
                  {typeof row[source] !== 'boolean' && dayjs(row[source]).isValid()
                    ? dayjs(row[source]).format('DD-MM-YYYY')
                    : row[source]}
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
