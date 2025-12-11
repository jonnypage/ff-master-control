import { useStats } from '@/lib/api/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, DollarSign } from 'lucide-react'

export function Dashboard() {
  const { data, isLoading } = useStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your Freedom Fighters event
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Teams</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{data?.teams.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active teams</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Missions</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{data?.missions.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Available missions</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground leading-relaxed">
              Use the navigation menu to access teams, missions, and store features
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
