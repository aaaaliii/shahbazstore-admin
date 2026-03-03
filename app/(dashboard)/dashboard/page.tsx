import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  // Fetch stats on client-side only to ensure auth token is available
  return <DashboardClient />;
}
