import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function BillingCancel() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Checkout cancelled</h1>
      <p className="text-muted-foreground">No payment was made and nothing has changed. You can upgrade whenever you're ready.</p>
      <div className="flex gap-2">
        <Button render={<Link to="/pricing" />} nativeButton={false}>Back to pricing</Button>
        <Button variant="outline" render={<Link to="/dashboard" />} nativeButton={false}>Dashboard</Button>
      </div>
    </div>
  )
}
