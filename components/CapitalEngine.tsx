
import React, { useState, useEffect } from 'react';
import { Calculator, Save, Info, Lock, FileText, Sliders } from 'lucide-react';
import { FinancialData, User, OpEvent } from '../types';
import { exportCSV, printPage } from '../src/services/reporting';

interface CapitalEngineProps {
    user?: User | null;
    events?: OpEvent[];
    logAction?: (module: string, type: any, action: string) => void;
}

// Basel III SMA buckets (€M): bucket 1 ≤ 1,000 ; bucket 2 ≤ 30,000 ; bucket 3 > 30,000
const BUCKET_BREAK_1 = 1000;
const BUCKET_BREAK_2 = 30000;
const COEF_1 = 0.12;
const COEF_2 = 0.15;
const COEF_3 = 0.18;

const computeBIC = (BI: number) => {
    if (BI <= BUCKET_BREAK_1) return BI * COEF_1;
    if (BI <= BUCKET_BREAK_2) return BUCKET_BREAK_1 * COEF_1 + (BI - BUCKET_BREAK_1) * COEF_2;
    return BUCKET_BREAK_1 * COEF_1 + (BUCKET_BREAK_2 - BUCKET_BREAK_1) * COEF_2 + (BI - BUCKET_BREAK_2) * COEF_3;
};

const CapitalEngine: React.FC<CapitalEngineProps> = ({ user, events, logAction }) => {
    const canEdit = user?.role === 'OpRisk' || user?.role === 'Administrator';

    const [financials, setFinancials] = useState<FinancialData>({
        interestIncome: 1500,
        interestExpense: 900,
        interestEarningAssets: 50000,
        serviceIncomeOther: 200,
        serviceExpenseOther: 80,
        feeIncome: 250,
        feeExpense: 60,
        tradingPnL: 150,
        bankingPnL: 50,
        avgAnnualLoss: 15
    });

    const [useDefaultIlm, setUseDefaultIlm] = useState(false);
    const [stress, setStress] = useState(0); // % uplift / haircut

    const [results, setResults] = useState({
        ildc: 0, sc: 0, fc: 0, bi: 0, bic: 0, ilm: 0, lc: 0, capital: 0
    });

    // Auto-fill avg loss from approved events if available
    useEffect(() => {
        if (!events || events.length === 0) return;
        const yearly = new Map<number, number>();
        events.filter(e => e.status === 'Approved').forEach(e => {
            if (!e.dateDiscovery) return;
            const y = new Date(e.dateDiscovery).getFullYear();
            const net = (e.amount || 0) - (e.recoveryDirect || 0) - (e.recoveryInsurance || 0);
            yearly.set(y, (yearly.get(y) || 0) + net);
        });
        if (yearly.size > 0) {
            const avg = Array.from(yearly.values()).reduce((a, b) => a + b, 0) / yearly.size / 1e6;
            setFinancials(f => ({ ...f, avgAnnualLoss: Math.round(avg * 100) / 100 }));
        }
    }, [events]);

    useEffect(() => {
        // ILDC: min(|II - IE|, 2.25% * IEA) + |Banking PnL|
        const netInterest = Math.abs(financials.interestIncome - financials.interestExpense);
        const cap225 = 0.0225 * financials.interestEarningAssets;
        const ILDC = Math.min(netInterest, cap225) + Math.abs(financials.bankingPnL);

        // SC: max(OOI, OOE) + max(Fee Inc, Fee Exp)
        const SC = Math.max(financials.serviceIncomeOther, financials.serviceExpenseOther)
            + Math.max(financials.feeIncome, financials.feeExpense);

        // FC: |Trading P&L|
        const FC = Math.abs(financials.tradingPnL);

        const BI = (ILDC + SC + FC) * (1 + stress / 100);
        const BIC = computeBIC(BI);

        let ILM = 1;
        const LC = 15 * financials.avgAnnualLoss;
        if (!useDefaultIlm) {
            const ratio = BIC > 0 ? LC / BIC : 0;
            ILM = Math.log(Math.exp(1) - 1 + Math.pow(ratio, 0.8));
        }

        const Capital = BIC * ILM;

        setResults({
            ildc: ILDC, sc: SC, fc: FC,
            bi: BI, bic: BIC, ilm: ILM, lc: LC, capital: Capital
        });
    }, [financials, useDefaultIlm, stress]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFinancials({ ...financials, [e.target.name]: Number(e.target.value) });
    };

    const exportReport = () => {
        exportCSV('sma_capital_breakdown', [{
            ILDC: results.ildc, SC: results.sc, FC: results.fc,
            BI: results.bi, BIC: results.bic, LC: results.lc, ILM: results.ilm,
            Capital: results.capital, Stress: stress, useDefaultILM: useDefaultIlm
        }]);
        logAction?.('Capital Engine', 'Execution', 'Exported SMA report');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Capital Engine</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Basel III Standardized Measurement Approach (SMA)</p>
                </div>
                {!canEdit && (
                    <div className="flex items-center text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full text-xs font-bold">
                        <Lock className="w-3 h-3 mr-1" /> Read Only
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm h-fit relative">
                    {!canEdit && <div className="absolute inset-0 z-10 bg-white/10 dark:bg-black/10 cursor-not-allowed"></div>}
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-brand-brown" /> Financial Inputs (€M)
                    </h3>

                    <div className="space-y-3">
                        <Group label="Interest Component (ILDC)">
                            <Pair name="interestIncome" label="Interest Income" v={financials.interestIncome} onChange={handleInput} />
                            <Pair name="interestExpense" label="Interest Expense" v={financials.interestExpense} onChange={handleInput} />
                            <Pair name="interestEarningAssets" label="Interest Earning Assets" v={financials.interestEarningAssets} onChange={handleInput} />
                            <Pair name="bankingPnL" label="Banking Book P&L" v={financials.bankingPnL} onChange={handleInput} />
                        </Group>

                        <Group label="Services Component (SC)">
                            <Pair name="serviceIncomeOther" label="Other Op Income" v={financials.serviceIncomeOther} onChange={handleInput} />
                            <Pair name="serviceExpenseOther" label="Other Op Expense" v={financials.serviceExpenseOther} onChange={handleInput} />
                            <Pair name="feeIncome" label="Fee & Commission Income" v={financials.feeIncome} onChange={handleInput} />
                            <Pair name="feeExpense" label="Fee & Commission Expense" v={financials.feeExpense} onChange={handleInput} />
                        </Group>

                        <Group label="Financial Component (FC)">
                            <Pair name="tradingPnL" label="Trading Book P&L" v={financials.tradingPnL} onChange={handleInput} />
                        </Group>

                        <Group label="Loss Component">
                            <Pair name="avgAnnualLoss" label="Avg Annual Loss (10y)" v={financials.avgAnnualLoss} onChange={handleInput} />
                            <p className="text-[10px] text-slate-400 mt-1">{events && events.length > 0 ? `Auto-derived from ${events.filter(e => e.status === 'Approved').length} approved events` : 'Enter manually'}</p>
                            <label className="flex items-center mt-2 text-xs">
                                <input type="checkbox" checked={useDefaultIlm} onChange={(e) => setUseDefaultIlm(e.target.checked)} className="mr-2" />
                                Force ILM = 1 (national discretion)
                            </label>
                        </Group>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-brand-brown/90 to-slate-900/90 p-8 rounded-2xl border border-brand-brown/30 text-white">
                        <p className="text-sm opacity-90">Total Capital Requirement (SMA)</p>
                        <div className="text-6xl font-bold tracking-tighter mt-2">
                            € {results.capital.toLocaleString(undefined, { maximumFractionDigits: 1 })} M
                        </div>
                        <div className="flex space-x-3 mt-4">
                            {canEdit && (
                                <button onClick={() => logAction?.('Capital Engine', 'Execution', 'Saved simulation')} className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm border border-white/10">
                                    <Save className="w-4 h-4 mr-2" /> Save
                                </button>
                            )}
                            <button onClick={exportReport} className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm border border-white/10">
                                <FileText className="w-4 h-4 mr-2" /> Export CSV
                            </button>
                            <button onClick={printPage} className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm border border-white/10">
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Stress slider */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold flex items-center"><Sliders className="w-4 h-4 mr-2 text-brand-brown" /> Stress / What-if</h3>
                            <span className="text-xl font-bold font-mono">{stress > 0 ? '+' : ''}{stress}%</span>
                        </div>
                        <input type="range" min="-30" max="50" step="5" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full accent-brand-brown" disabled={!canEdit} />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>-30% (benign)</span><span>0%</span><span>+50% (severe)</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Calculation Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ResultBox label="ILDC" value={results.ildc} />
                            <ResultBox label="SC" value={results.sc} />
                            <ResultBox label="FC" value={results.fc} />
                            <ResultBox label="BI" value={results.bi} highlight />
                            <ResultBox label="BIC" value={results.bic} />
                            <ResultBox label="Loss Component" value={results.lc} />
                            <ResultBox label="ILM" value={results.ilm} unit="" />
                            <ResultBox label="Capital" value={results.capital} highlight />
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-500/20 flex items-start">
                            <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                BI = ILDC + SC + FC. Bucketed BIC: 12% (≤€1bn) + 15% (€1–30bn) + 18% (&gt;€30bn). ILM = ln(e − 1 + (LC/BIC)^0.8) where LC = 15 × avg annual loss.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Group = ({ label, children }: any) => (
    <div className="border-t border-slate-200 dark:border-white/10 pt-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-2">{children}</div>
    </div>
);

const Pair = ({ name, label, v, onChange }: any) => (
    <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400 text-xs">{label}</span>
        <input name={name} type="number" value={v} onChange={onChange} className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded p-1 text-right text-sm" />
    </div>
);

const ResultBox = ({ label, value, unit = '€ M', highlight = false }: any) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-brand-brown/10 border-brand-brown/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5'}`}>
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">
            {unit === '' ? value.toFixed(3) : `${unit} ${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}`}
        </p>
    </div>
);

export default CapitalEngine;
