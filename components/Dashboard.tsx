import React from 'react';
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
import { TrendingUp, AlertOctagon, CheckCircle, DollarSign, Calculator } from 'lucide-react';
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Operational Risk Posture & Capital Consumption</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
           <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-500/25">
             Generate Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="YTD Gross Loss" 
          value="€ 2.4M" 
          trend="+12%" 
          icon={DollarSign} 
          color="bg-red-500 text-red-500" 
        />
        <StatCard 
          title="Critical Incidents" 
          value="14" 
          trend="-2" 
          icon={AlertOctagon} 
          color="bg-orange-500 text-orange-500" 
        />
        <StatCard 
          title="RCSA Completion" 
          value="87%" 
          trend="+5%" 
          icon={CheckCircle} 
          color="bg-emerald-500 text-emerald-500" 
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Loss Trend (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataLossTrend}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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

        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Loss by Event Type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataRiskType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataRiskType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Top 5 Critical Risks</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="text-slate-400 text-sm border-b border-slate-200 dark:border-white/10">
                          <th className="py-3 px-4">Risk ID</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Business Line</th>
                          <th className="py-3 px-4 text-center">Inherent</th>
                          <th className="py-3 px-4 text-center">Residual</th>
                      </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-300">
                      {[1,2,3,4,5].map((i) => (
                          <tr key={i} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-mono text-xs">R-2023-00{i}</td>
                              <td className="py-3 px-4">Potential failure in {BUSINESS_LINES[i % BUSINESS_LINES.length]} reconciliation process.</td>
                              <td className="py-3 px-4 text-sm">{BUSINESS_LINES[i % BUSINESS_LINES.length]}</td>
                              <td className="py-3 px-4 text-center"><span className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-xs font-bold">High</span></td>
                              <td className="py-3 px-4 text-center"><span className="px-2 py-1 rounded bg-orange-500/20 text-orange-500 text-xs font-bold">Medium</span></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;