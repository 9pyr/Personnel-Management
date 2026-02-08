interface TabPanelProps {
  value: number
  index: number
  children: React.ReactNode
}

export default function TabPanel({ value, index, children }: TabPanelProps) {
  if (value !== index) return null
  return <div role="tabpanel">{children}</div>
}
