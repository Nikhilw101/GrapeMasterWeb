import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Users,
    DollarSign,
    Package,
    ArrowUpRight,
    Ban,
    Store,
    TrendingUp
} from 'lucide-react';
import { getDashboardStats } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                if (response.success) {
                    setStats(response.data.stats);
                    setAnalytics(response.data.analytics);
                    setRecentOrders(response.data.recentOrders);
                }
            } catch (error) {
                toast.error('Failed to load dashboard statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 min-w-0">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`₹${Number(stats?.totalRevenue || 0).toLocaleString()}`}
                    color="bg-emerald-500"
                    delay={0}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={stats?.totalOrders ?? 0}
                    color="bg-blue-500"
                    delay={0.1}
                />
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.totalUsers ?? 0}
                    color="bg-violet-500"
                    delay={0.2}
                />
                <StatCard
                    icon={Package}
                    label="Pending Orders"
                    value={stats?.pendingOrders ?? 0}
                    color="bg-amber-500"
                    delay={0.3}
                />
                <StatCard
                    icon={Ban}
                    label="Cancellations"
                    value={`${stats?.cancelledOrders ?? 0} (${stats?.cancellationRate ?? 0}%)`}
                    color="bg-red-500"
                    delay={0.35}
                />
                <StatCard
                    icon={Store}
                    label="Dealer Requests"
                    value={`${stats?.dealerPending ?? 0} pending / ${stats?.dealerTotal ?? 0} total`}
                    color="bg-indigo-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Trend (Last 7 Days)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.salesTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="_id"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h2>
                    <div className="space-y-6">
                        {analytics?.topProducts?.length > 0 ? (
                            analytics.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>No sales data yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* User Growth (last 30 days) */}
            {analytics?.userGrowth?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6">User Growth (Last 30 Days)</h2>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="New users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center">
                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="pb-3 pl-4">Order ID</th>
                                <th className="pb-3">Customer</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right pr-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 pl-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                                        <td className="py-3 text-sm text-gray-600">{order.user?.name || 'Unknown'}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-4 text-sm font-bold text-gray-900">
                                            ₹{order.pricing.total.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                        No recent orders
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
