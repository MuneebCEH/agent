'use client'

import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Users, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityLog } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ReportsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const res = await fetch('/api/reports');
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        }
    });

    if (isLoading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="animate-spin mr-2" /> Loading Report...</div>;

    const chartData = data?.statusCounts.map((item: { status: string; _count: { status: number } }) => ({
        name: item.status,
        value: item._count.status
    })) || [];

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-white mb-6">Monthly Performance Report</h1>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Total Leads</h3>
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {chartData.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0)}
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Conversion Rate</h3>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    {/* Mock conversion calculation */}
                    <p className="text-3xl font-bold text-white">
                        {((chartData.find((c: { name: string; value: number }) => c.name === 'Sale Completed')?.value || 0) / (chartData.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0) || 1) * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Activities</h3>
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{data?.recentActivity?.length || 0}+</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Lead Status Distribution</h3>
                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                        Chart temporarily disabled for build verification
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {data?.recentActivity?.map((log: ActivityLog) => (
                            <div key={log.id} className="text-sm border-b border-slate-800 pb-3 last:border-0">
                                <div className="flex justify-between text-slate-400 mb-1">
                                    <span className="font-medium text-white">{log.user.name}</span>
                                    <span className="text-xs">{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</span>
                                </div>
                                <div className="text-slate-500">
                                    {log.action}: {log.lead.name} ({log.previousStatus} → <span className="text-blue-400">{log.newStatus}</span>)
                                </div>
                            </div>
                        ))}
                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                            <p className="text-slate-500 text-center py-4">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
