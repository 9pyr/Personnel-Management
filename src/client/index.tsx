import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import theme from '../common/styles/theme'
import { router } from '../routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
