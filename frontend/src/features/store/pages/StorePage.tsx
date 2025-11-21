import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Store</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Teams can spend credits here
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium text-lg">Store interface coming soon</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will allow teams to spend their credits
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

