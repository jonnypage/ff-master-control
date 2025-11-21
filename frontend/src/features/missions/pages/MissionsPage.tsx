import { MissionList } from '../components/MissionList'

export function MissionsPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Missions</h1>
      <MissionList />
    </div>
  )
}

