import { Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react"

function DashboardPage() {
  return (
    <div>
      <Card className="mx-4">
        <CardHeader>Header</CardHeader>
        <Divider />
        <CardBody>
          <Input type="email" label="Email" className="max-w-xs" />
        </CardBody>
      </Card>
    </div>
  )
}

export default DashboardPage
