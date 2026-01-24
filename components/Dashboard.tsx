
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, AlertOctagon, CheckCircle, DollarSign, Calculator, Settings, Filter, X, Shield, ArrowRight } from 'lucide-react';
import { BUSINESS_LINES } from '../types';

const dataLossTrend = [
  { name: 'Jan', loss: 4000 },
  { name: 'Feb', loss: 3000 },
  { name: 'Mar', loss: 2000 },
  { name: 'Apr', loss: 2780 },
  { name: 'May', loss: 1890 },
  { name: 'Jun', loss: 2390 },
  { name: 'Jul', loss: 3490 },
];

const dataRiskType = [
  { name: 'Ext. Fraud', value: 400 },
  { name: 'Int. Fraud', value: 300 },
  { name: 'Execution', value: 300 },
  { name: 'Business', value: 200 },
];

// Mock Data for Controls awaiting validation
const pendingControls = [
  { id: 'CTRL-02', name: 'Daily reconciliation report', department: 'Ops Team', testedDate: '2023-10-20' },
  { id: 'CTRL-09', name: 'Trader Limit Review', department: 'Trading & Sales', testedDate: '2023-10-22' },
  { id: 'CTRL-14', name: 'Firewall Log Audit', department: 'IT Security', testedDate: '2023-10-23' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" /> {trend}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Customization State
  const [criticalThreshold, setCriticalThreshold] = useState(10000);
  const [targetRCSA, setTargetRCSA] = useState(90);

  // Fake filtered data logic
  const criticalIncidentsCount = 14 + (criticalThreshold < 5000 ? 5 : 0) - (criticalThreshold > 20000 ? 5 : 0);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Operational Risk Posture & Capital Consumption</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" /> Customize View
          </button>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-500/25">
            Generate Report
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center"><Filter className="w-4 h-4 mr-2" /> Dashboard Configuration</h3>
            <button onClick={() => setShowSettings(false)}><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Critical Incident Threshold (€)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1000" max="50000" step="1000"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-mono font-bold w-20 text-right">€{criticalThreshold / 1000}k</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Incidents above this amount are flagged as Critical.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Target RCSA Completion (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50" max="100" step="5"
                  value={targetRCSA}
                  onChange={(e) => setTargetRCSA(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-mono font-bold w-20 text-right">{targetRCSA}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="YTD Gross Loss"
          value="€ 2.4M"
          trend="+12%"
          icon={DollarSign}
          color="bg-red-500 text-red-500"
        />
        <StatCard
          title={`Critical Incidents (>€${criticalThreshold / 1000}k)`}
          value={criticalIncidentsCount}
          trend="-2"
          icon={AlertOctagon}
          color="bg-orange-500 text-orange-500"
        />
        <StatCard
          title="RCSA Completion"
          value="87%"
          trend={87 >= targetRCSA ? "On Track" : "Lagging"}
          icon={CheckCircle}
          color={87 >= targetRCSA ? "bg-emerald-500 text-emerald-500" : "bg-yellow-500 text-yellow-500"}
        />
        <StatCard
          title="Capital (SMA)"
          value="€ 145M"
          trend="+1.2%"
          icon={Calculator}
          color="bg-purple-500 text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart: Loss Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Loss Trend (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataLossTrend}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoss)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Split between Control Queue and Pie Chart */}
        <div className="space-y-6">

          {/* Control Validation Queue (New) */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Shield className="w-4 h-4 mr-2 text-brand-brown" />
                Control Validation Queue
              </h3>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingControls.length}</span>
            </div>
            <div className="space-y-3">
              {pendingControls.map(ctrl => (
                <div key={ctrl.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 hover:border-brand-brown transition-colors cursor-pointer group">
                  <div className="flex justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">{ctrl.id}</span>
                    <span className="text-xs text-slate-400">{ctrl.testedDate}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 truncate">{ctrl.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">{ctrl.department}</span>
                    <span className="text-xs text-brand-brown font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Review <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart: Loss by Type */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Loss by Event Type</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataRiskType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataRiskType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', zIndex: 1000 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
