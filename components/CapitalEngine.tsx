import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Save } from 'lucide-react';
import { FinancialData } from '../types';

const CapitalEngine: React.FC = () => {
  const [financials, setFinancials] = useState<FinancialData>({
    interestIncome: 1500,
    interestExpense: 900,
    serviceIncome: 400,
    serviceExpense: 100,
    financialIncome: 200,
    avgAnnualLoss: 15 
  });

  const [results, setResults] = useState({
    bi: 0,
    bic: 0,
    ilm: 0,
    capital: 0
  });

  // Calculate whenever financials change
  useEffect(() => {
    // 1. Business Indicator (Simplified for demo)
    // ILDC = Min(Abs(Interest Income - Interest Expense), 2.25% * Interest Earning Assets) -> Simplified to net interest
    const interestComponent = Math.abs(financials.interestIncome - financials.interestExpense);
    // SC = Max(Other Op Income, Other Op Expense) + Max(Fee Income, Fee Expense) -> Simplified
    const servicesComponent = Math.max(financials.serviceIncome, financials.serviceExpense);
    // FC = Abs(Net P&L Trading) -> Simplified
    const financialComponent = Math.abs(financials.financialIncome);

    const BI = interestComponent + servicesComponent + financialComponent;

    // 2. BIC (Business Indicator Component)
    // Basel III Buckets:
    // 0-1bn: 12%
    // 1-30bn: 15%
    // >30bn: 18%
    // Simplified: flat 15% for demo or simple tiered
    let BIC = 0;
    if (BI <= 1000) {
        BIC = BI * 0.12;
    } else {
        // Simple marginal calculation demo
        BIC = (1000 * 0.12) + ((BI - 1000) * 0.15); 
    }

    // 3. ILM (Internal Loss Multiplier)
    // Formula: ILM = ln(exp(1) - 1 + (LC / BIC)^0.8)
    // LC (Loss Component) = 15 * Average Annual Operational Risk Losses
    const LC = 15 * financials.avgAnnualLoss;
    
    // Safety check for div by zero
    const ratio = BIC > 0 ? LC / BIC : 0;
    // Implementation of Basel III Formula
    const ILM = Math.log(Math.exp(1) - 1 + Math.pow(ratio, 0.8));

    // 4. Capital
    const Capital = BIC * ILM;

    setResults({
        bi: BI,
        bic: BIC,
        ilm: ILM,
        capital: Capital
    });

  }, [financials]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFinancials({
          ...financials,
          [e.target.name]: Number(e.target.value)
      });
  };

  const ResultBox = ({ label, value, unit = '€ M' }: { label: string, value: number, unit?: string }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {unit === '' ? value.toFixed(3) : `${unit} ${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}`}
        </p>
    </div>
  );

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Capital Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Basel III Standardized Measurement Approach (SMA) Calculator</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm h-fit">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-brand-brown dark:text-orange-400" />
                    Financial Inputs (Millions)
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Interest Component</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input name="interestIncome" type="number" value={financials.interestIncome} onChange={handleInput} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Income" />
                            <input name="interestExpense" type="number" value={financials.interestExpense} onChange={handleInput} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Expense" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Services Component</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input name="serviceIncome" type="number" value={financials.serviceIncome} onChange={handleInput} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Income" />
                            <input name="serviceExpense" type="number" value={financials.serviceExpense} onChange={handleInput} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Expense" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Financial Component</label>
                        <div className="mt-1">
                             <input name="financialIncome" type="number" value={financials.financialIncome} onChange={handleInput} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Net P&L" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                        <label className="text-xs font-bold text-slate-400 uppercase">Historical Loss Data</label>
                        <div className="mt-1">
                             <input name="avgAnnualLoss" type="number" value={financials.avgAnnualLoss} onChange={handleInput} className="w-full bg-slate-50 dark:bg-slate-900 border border-red-500/20 rounded-lg p-2 text-sm text-slate-900 dark:text-white" placeholder="Avg Annual Loss (10y)" />
                             <p className="text-xs text-slate-500 mt-1">Average annual net loss over past 10 years</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-brand-brown/90 to-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-brand-brown/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-brand-brown/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <h3 className="text-lg font-medium text-orange-200 mb-2">Total Capital Requirement (SMA)</h3>
                    <div className="text-6xl font-bold text-white tracking-tighter mb-4">
                        € {results.capital.toLocaleString(undefined, { maximumFractionDigits: 1 })} M
                    </div>
                    
                    <div className="flex space-x-4">
                        <button className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors border border-white/10">
                            <Save className="w-4 h-4 mr-2" /> Save Simulation
                        </button>
                        <button className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm transition-colors shadow-lg shadow-black/20">
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Calculation Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ResultBox label="Business Indicator (BI)" value={results.bi} />
                        <ResultBox label="BI Component (BIC)" value={results.bic} />
                        <ResultBox label="ILM Multiplier" value={results.ilm} unit="" />
                        <ResultBox label="Loss Component" value={financials.avgAnnualLoss * 15} />
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/20 flex items-start">
                        <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-500">ILM Sensitivity</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-600/80 mt-1">
                                Your Internal Loss Multiplier is {results.ilm.toFixed(3)}. Since it is {results.ilm > 1 ? 'greater' : 'less'} than 1, your past operational losses are {results.ilm > 1 ? 'increasing' : 'decreasing'} your capital requirement relative to the industry baseline.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CapitalEngine;