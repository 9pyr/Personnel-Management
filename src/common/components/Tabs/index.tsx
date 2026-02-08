import { useState } from 'react'

import { Tabs as BaseTabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabsProps {
  items: { label: string; element: JSX.Element }[]
}

export default function Tabs({ items }: TabsProps) {
  const [value, setValue] = useState(0)

  return (
    <BaseTabs value={String(value)} onValueChange={v => setValue(Number(v))} className="w-full">
      <TabsList>
        {items.map(({ label }, index) => (
          <TabsTrigger key={index} value={String(index)}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(({ element }, index) => (
        <TabsContent key={index} value={String(index)}>
          {element}
        </TabsContent>
      ))}
    </BaseTabs>
  )
}
