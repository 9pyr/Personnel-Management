import { cyan, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: cyan[600],
    },
    secondary: {
      main: cyan[900],
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
})

export default theme
