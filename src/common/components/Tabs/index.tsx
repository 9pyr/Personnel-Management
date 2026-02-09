import { Tabs as BaseTabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { type ReactElement, useState } from 'react'

interface TabsProps {
  items: { label: string; element: ReactElement }[]
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
