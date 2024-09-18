import Paper from '@mui/material/Paper'
import BaseTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

interface TableProps {
  columns: {
    label: string
    source: string
  }[]
  data: {
    [key: string]: string | number | null | undefined | boolean
  }[]
}

const Table = ({ columns, data }: TableProps) => {
  return (
    <TableContainer component={Paper}>
      <BaseTable sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map(({ label }) => (
              <TableCell>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={`table-row:${index}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {columns.map(({ source }) => (
                <TableCell>{row[source]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </BaseTable>
    </TableContainer>
  )
}

export default Table
