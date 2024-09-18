import { Box } from '@mui/material'

import React from 'react'

interface TabPanelProps {
  index: number
  value: number
}

const TabPanel = ({ children, value, index, ...props }: React.PropsWithChildren<TabPanelProps>) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...props}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default TabPanel
