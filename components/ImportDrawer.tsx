import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';

interface ImportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onImport: (files: File[]) => void;
}

const ImportDrawer: React.FC<ImportDrawerProps> = ({ isOpen, onClose, title, onImport }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleImportClick = () => {
        if (files.length === 0) return;

        setIsSimulating(true);
        // Simulate progress
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setIsSimulating(false);
                onImport(files);
                setFiles([]);
                setProgress(0);
                onClose();
            }
        }, 150);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Upload className="w-6 h-6 mr-3 text-brand-brown" />
                        {title}
                    </h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging
                            ? 'border-brand-brown bg-brand-brown/5 scale-105'
                            : 'border-slate-300 dark:border-slate-700 hover:border-brand-brown/50 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>

                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Drag & Drop files here
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Supported formats: .csv, .xls, .xlsx. Max file size: 10MB.
                    </p>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".csv,.xlsx,.xls"
                        multiple
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer px-6 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                    >
                        Browse Files
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Selected Files</h4>
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/5">
                                <FileText className="w-5 h-5 text-blue-500 mr-3" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                    className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isSimulating && (
                    <div className="mt-8">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                            <span>Importing...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div className="bg-brand-brown h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
                    <button
                        onClick={handleImportClick}
                        disabled={files.length === 0 || isSimulating}
                        className="w-full py-3.5 rounded-xl bg-brand-brown hover:bg-orange-800 text-white font-bold shadow-lg shadow-brand-brown/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSimulating ? 'Processing...' : (
                            <>
                                Import {files.length} File{files.length !== 1 ? 's' : ''} <CheckCircle className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Data will be validated upon import.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImportDrawer;
