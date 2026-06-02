import React, { useState, useEffect } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { isSupabaseConfigured } from '../supabaseClient';
import {
  Settings,
  Key,
  Database,
  Building,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    saveSetting,
    refreshAll
  } = useValithOS();

  // Settings states
  const [companyName, setCompanyName] = useState('Valith AI Solutions');
  const [founderName, setFounderName] = useState('Valith Founder');
  const [baseCurrency, setBaseCurrency] = useState('PKR');
  const [mrrGoal, setMrrGoal] = useState('1000000');
  
  // Gemini Key state
  const [geminiKey, setGeminiKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate fields
    const getVal = (key: string, fallback: string) => {
      const match = settings.find((s) => s.key === key);
      return match ? match.value : fallback;
    };

    setCompanyName(getVal('company_name', 'Valith AI Solutions'));
    setFounderName(getVal('founder_name', 'Valith Founder'));
    setBaseCurrency(getVal('base_currency', 'PKR'));
    setMrrGoal(getVal('mrr_goal', '1000000'));

    const storedKey = localStorage.getItem('vos_gemini_api_key') || '';
    setGeminiKey(storedKey);
  }, [settings]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      await saveSetting('company_name', companyName);
      await saveSetting('founder_name', founderName);
      await saveSetting('base_currency', baseCurrency);
      await saveSetting('mrr_goal', mrrGoal);

      // Save Gemini Key
      if (geminiKey.trim()) {
        localStorage.setItem('vos_gemini_api_key', geminiKey.trim());
      } else {
        localStorage.removeItem('vos_gemini_api_key');
      }

      setStatusMsg('Configuration saved successfully.');
      refreshAll();
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Error: ${err.message || err}`);
    }
  };

  const isEnvGeminiKeyPresent = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-bold tracking-tight uppercase">Workspace Settings</h1>
        <p className="text-xs text-typography-muted">Configure API integrations, workspace variables, and database diagnostics</p>
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* API INTEGRATION PANEL */}
        <div className="card-premium space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-typography">
            <Key size={14} className="text-aurum" />
            <span>AI Provider Configurations</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="font-bold text-typography-muted uppercase text-[9px]">Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={isEnvGeminiKeyPresent ? "Loaded from VITE_GEMINI_API_KEY env" : "Paste API Key here..."}
                className="w-full text-xs"
              />
              <span className="text-[10px] text-typography-light mt-1">
                {isEnvGeminiKeyPresent ? (
                  <span className="text-aurum font-semibold">✓ Environment variable `VITE_GEMINI_API_KEY` is present and active.</span>
                ) : (
                  <span>Provide a key to unlock the AI Advisor & Inbox Parser. Stored locally in your browser sandbox.</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* WORKSPACE PROFILE PANEL */}
        <div className="card-premium space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-typography">
            <Building size={14} className="text-aurum" />
            <span>Workspace Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="font-bold text-typography-muted uppercase text-[9px]">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="font-bold text-typography-muted uppercase text-[9px]">Founder Name</label>
              <input
                type="text"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                className="w-full text-xs"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="font-bold text-typography-muted uppercase text-[9px]">Base Operating Currency</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full text-xs"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="font-bold text-typography-muted uppercase text-[9px]">Target MRR Goal</label>
              <input
                type="number"
                value={mrrGoal}
                onChange={(e) => setMrrGoal(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* DATABASE STATUS PANEL */}
        <div className="card-premium space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-typography">
            <Database size={14} className="text-aurum" />
            <span>Database Connection Health</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center space-x-2">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle size={16} className="text-aurum shrink-0" />
                  <span className="font-bold text-typography leading-none">SUPABASE SERVER ONLINE</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <span className="font-bold text-red-500 leading-none">SUPABASE OFFLINE — LOCAL SANDBOX ACTIVE</span>
                </>
              )}
            </div>
            <p className="text-typography-muted leading-relaxed text-[11px]">
              {isSupabaseConfigured
                ? "The workspace is linked to your Supabase Postgres database. All operations read and write to your cloud host."
                : "No cloud configuration keys found in the environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). All data operations are compiled and persisted in your local browser sandbox."}
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 bg-aurum-glow text-aurum-dark rounded text-xs">
            {statusMsg}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-typography hover:bg-typography/90 text-white py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all"
        >
          Save Workspace Configurations
        </button>
      </form>
    </div>
  );
};
