import StatCard from './StatCard';

export default function DashboardStats({ stats }) {
  return (
    <section aria-labelledby="dashboard-stats-heading" className="mt-6">
      <h2 id="dashboard-stats-heading" className="sr-only">
        Dashboard key metrics
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}
