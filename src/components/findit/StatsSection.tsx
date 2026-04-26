"use client";

interface StatsSectionProps {
  stats: {
    totalItems: number;
    recovered: number;
    activeUsers: number;
    successRate: number;
  };
}

const statItems = [
  { key: 'totalItems', label: 'Total Items', color: 'from-blue-50', suffix: '+' },
  { key: 'recovered', label: 'Recovered', color: 'from-cyan-50', suffix: '+' },
  { key: 'activeUsers', label: 'Active Users', color: 'from-blue-50', suffix: '+' },
  { key: 'successRate', label: 'Success Rate', color: 'from-cyan-50', suffix: '%' }
] as const;

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section id="stats" className="py-20 bg-white font-sans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Platform Statistics
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how FindIT is making a difference in our community
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {statItems.map((item, index) => (
            <div
              key={item.key}
              className={`text-center p-6 rounded-2xl bg-gradient-to-br ${item.color} to-transparent animate-fade-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 font-heading">
                {stats[item.key as keyof typeof stats]}
                {item.suffix}
              </div>
              <div className="text-gray-600 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
