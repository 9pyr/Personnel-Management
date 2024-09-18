import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import BaseTabs from '@mui/material/Tabs'

import { useState } from 'react'

import TabPanel from './components/TabPanel'

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

interface TabsProps {
  items: { label: string; element: JSX.Element }[]
}

export default function Tabs({ items }: TabsProps) {
  const [value, setValue] = useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <BaseTabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {items.map(({ label }, index) => (
            <Tab label={label} {...a11yProps(index)} />
          ))}
        </BaseTabs>
      </Box>
      {items.map(({ element }, index) => (
        <TabPanel value={value} index={index}>
          {element}
        </TabPanel>
      ))}
    </Box>
  )
}
