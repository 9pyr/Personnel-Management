import { createTheme, alpha } from '@mui/material/styles'

const tealMain = '#00796B'
const tealLight = '#B2DFDB'
const tealDark = '#004D40'
const blueMain = '#0288D1'
const blueLight = '#B3E5FC'

const grayBorder = 'rgba(0, 0, 0, 0.08)'
const bgLightGray = '#F5F5F5'

const theme = createTheme({
  palette: {
    primary: {
      main: tealMain,
      light: tealLight,
      dark: tealDark,
      contrastText: '#fff',
    },
    secondary: {
      main: blueMain,
      light: blueLight,
      dark: '#01579B',
      contrastText: '#fff',
    },
    background: {
      default: bgLightGray,
      paper: '#FFFFFF',
    },
    divider: grayBorder,
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#C62828',
    },
    warning: {
      main: '#F9A825',
    },
  },
  typography: {
    fontFamily: '"Sarabun", "Inter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: grayBorder,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FFFFFF',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(tealMain, 0.1),
          color: tealDark,
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid',
          borderColor: grayBorder,
        },
      },
    },
  },
})

export default theme
