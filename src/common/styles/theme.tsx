import { cyan, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: cyan[200],
    },
    secondary: {
      main: cyan[900],
    },
    error: {
      main: red.A400,
    },
  },
})

export default theme
