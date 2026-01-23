
import React from 'react';

interface RiskGaugeProps {
    val: number;
    max?: number;
    label: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ val, max = 25, label }) => {
    const percentage = (val / max) * 100;
    let color = 'bg-green-500';
    if (percentage > 40) color = 'bg-yellow-500';
    if (percentage > 70) color = 'bg-red-500';

    return (
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-500 font-bold mb-1">{label}</span>
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">{val}/{max}</span>
        </div>
    );
};

export default RiskGauge;
