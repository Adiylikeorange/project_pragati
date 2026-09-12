import React from 'react';

const AlertBanner = ({ alert, onDismiss, onInspect }) => {
  if (!alert) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-md flex items-center justify-between relative z-40">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined animate-pulse text-white text-3xl">crisis_alert</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
              Early Warning Alert
            </span>
            <span className="text-red-200 text-xs font-medium">Auto-generated via ML Engine</span>
          </div>
          <div className="font-medium text-sm md:text-base">
            <span className="font-bold">{alert.project || 'Project'}</span>: {alert.message || 'Critical slippage predicted.'}
          </div>
          {alert.slippage && (
            <div className="text-xs text-red-200 mt-0.5">
              Predicted additional slippage: {alert.slippage} days | Requires Secretary-level review
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <button 
          onClick={onInspect}
          className="bg-white text-red-700 hover:bg-red-50 text-sm font-bold py-1.5 px-4 rounded shadow transition-colors border border-transparent hover:border-red-200"
        >
          Inspect Dossier
        </button>
        <button 
          onClick={onDismiss}
          className="text-red-200 hover:text-white p-1 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
