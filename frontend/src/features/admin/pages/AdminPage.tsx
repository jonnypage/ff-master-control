import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrative controls and settings
        </p>
      </div>
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium text-lg">Admin interface coming soon</p>
          <p className="text-sm text-muted-foreground mt-2">
            Additional administrative features will be available here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

