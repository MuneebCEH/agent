'use client'

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Folder, LayoutGrid, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ProjectStat {
    id: string;
    name: string;
    description: string | null;
    totalLeads: number;
    statusCounts: Record<string, number>;
    createdAt: string;
}

interface DashboardData {
    totalLeads: number;
    totalProjects: number;
    projectStats: ProjectStat[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then(setData)
            .catch((err) => {
                console.error(err);
                toast.error('Failed to load dashboard stats');
            })
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('complete') || s.includes('qualified')) return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (s.includes('not interested') || s.includes('not qualified')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (s.includes('follow-up') || s.includes('qc')) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-400 animate-pulse">Gathering intelligence...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full flex flex-col bg-slate-900 overflow-y-auto pb-10">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-blue-500" />
                        Executive Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">Real-time performance metrics across all projects</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="px-8 py-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Folder className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Projects</h3>
                                <p className="text-3xl font-bold text-white mt-1">{data.totalProjects}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Leads</h3>
                                <p className="text-3xl font-bold text-white mt-1">{data.totalLeads}</p>
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for other global metrics */}
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Avg Conversion</h3>
                                <p className="text-3xl font-bold text-white mt-1">12.5%</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <Clock className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Deals</h3>
                                <p className="text-3xl font-bold text-white mt-1">48</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Detailed List */}
            <div className="px-8 mt-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Project Performance</h2>
                        <Link href="/leads" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Manage Projects →
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {data.projectStats.map((project) => (
                            <div key={project.id} className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm transition-all hover:bg-slate-800">
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold text-white">{project.name}</h3>
                                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-500/20">
                                                ACTIVE
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm max-w-xl">
                                            {project.description || 'No description available for this project.'}
                                        </p>
                                        <div className="mt-6 flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Leads</span>
                                                <span className="text-xl font-bold text-white">{project.totalLeads}</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-700"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Created</span>
                                                <span className="text-sm font-medium text-slate-300">{new Date(project.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {Object.entries(project.statusCounts).slice(0, 4).map(([status, count]) => (
                                            <div key={status} className={`p-4 rounded-2xl border ${getStatusColor(status)} flex flex-col gap-1`}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{status}</span>
                                                <span className="text-xl font-bold">{count}</span>
                                            </div>
                                        ))}
                                        {Object.keys(project.statusCounts).length === 0 && (
                                            <div className="col-span-4 py-4 text-slate-500 text-sm text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                                                No lead activity yet
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/leads/${project.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-900/30 active:scale-95 group"
                                    >
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {data.projectStats.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700">
                                <LayoutGrid className="w-12 h-12 text-slate-600 mb-4" />
                                <h3 className="text-xl font-bold text-white">Dashboard Empty</h3>
                                <p className="text-slate-400 mt-2 max-w-xs px-4">Create a project and add some leads to see visual analytics here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
