"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  revenueTodayCents: number;
  revenueThisWeekCents: number;
  lowStockProducts?: Array<{ id: string; name: string; stock: number }>;
  revenueByDay?: Array<{ date: string; orders: number; revenue: number }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; email: string; totalCents: number; status: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders?limit=10"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (ordersRes.ok) setRecent(await ordersRes.json());
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }

  const lowStock = stats?.lowStockProducts ?? [];
  const revenueByDay = stats?.revenueByDay ?? [];

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="border border-border rounded-lg bg-surface p-4">
          <p className="font-sans text-sm text-muted">Orders today</p>
          <p className="font-sans text-2xl font-medium text-text mt-1">{stats?.ordersToday ?? 0}</p>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <p className="font-sans text-sm text-muted">Revenue today</p>
          <p className="font-sans text-2xl font-medium text-text mt-1">
            ${((stats?.revenueTodayCents ?? 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <p className="font-sans text-sm text-muted">Pending orders</p>
          <p className="font-sans text-2xl font-medium text-text mt-1">{stats?.pendingOrders ?? 0}</p>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <p className="font-sans text-sm text-muted">Total orders</p>
          <p className="font-sans text-2xl font-medium text-text mt-1">{stats?.totalOrders ?? 0}</p>
        </div>
      </div>

      {(lowStock.length > 0 || revenueByDay.length > 0) && (
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {lowStock.length > 0 && (
            <div className="border border-border rounded-lg bg-surface p-4">
              <h2 className="font-sans text-lg font-medium text-text mb-3">Low stock (≤5)</h2>
              <ul className="space-y-2 font-sans text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between items-center">
                    <Link href={`/admin/products/${p.id}/variations`} className="text-sage-dark hover:underline truncate mr-2">
                      {p.name}
                    </Link>
                    <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-amber-600"}>
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/products" className="font-sans text-sm text-sage-dark hover:underline mt-2 inline-block">
                View all products →
              </Link>
            </div>
          )}
          {revenueByDay.length > 0 && (
            <div className="border border-border rounded-lg bg-surface p-4">
              <h2 className="font-sans text-lg font-medium text-text mb-3">Revenue (last 7 days)</h2>
              <div className="space-y-2 font-sans text-sm">
                {[...revenueByDay].reverse().map((d) => (
                  <div key={d.date} className="flex justify-between items-center">
                    <span className="text-muted">{d.date}</span>
                    <span className="text-text">{d.orders} orders · ${(d.revenue / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="font-sans text-lg font-medium text-text mb-4">Recent orders</h2>
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="text-left p-3 font-medium text-text">Date</th>
                <th className="text-left p-3 font-medium text-text">Email</th>
                <th className="text-right p-3 font-medium text-text">Total</th>
                <th className="text-left p-3 font-medium text-text">Status</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-muted text-center">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recent.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-text">{order.email}</td>
                    <td className="p-3 text-right text-text">
                      ${(order.totalCents / 100).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className="capitalize text-muted">{order.status.toLowerCase()}</span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sage-dark hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          <Link href="/admin/orders" className="font-sans text-sm text-sage-dark hover:underline">
            View all orders →
          </Link>
        </p>
      </div>
    </div>
  );
}
