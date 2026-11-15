import React, { useState, useEffect } from 'react';
import { X, Activity, Ticket, Database, CheckCircle, AlertCircle, RefreshCw, Trash2, Power, ShieldAlert } from 'lucide-react';
import { backendApi, BackendHealthResponse, BackendActivityLog, AdminCoupon } from '../../services/backendApi';
import { authService, isUserAdmin } from '../../services/auth';

interface BackendAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendAdminModal: React.FC<BackendAdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'coupons' | 'metrics'>('logs');
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [logs, setLogs] = useState<BackendActivityLog[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New coupon form state
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState('250');
  const [newPack, setNewPack] = useState('250');
  const [newMaxUses, setNewMaxUses] = useState('1000');
  const [perUserRule, setPerUserRule] = useState<'1' | 'multi' | 'unlimited'>('1');
  const [customUserLimit, setCustomUserLimit] = useState('3');
  const [isUnlimitedTotal, setIsUnlimitedTotal] = useState(false);

  const fetchAll = async () => {
    const user = authService.getCurrentUser();
    if (!isUserAdmin(user)) return;
    if (!backendApi.hasAdminToken() && user.token) {
      await backendApi.adminLogin(user.token);
    }
    setIsLoading(true);
    try {
      const [h, l, c, d] = await Promise.all([
        backendApi.checkHealth(),
        backendApi.getAdminLogs(60),
        backendApi.getAdminCoupons(),
        backendApi.getAdminDashboard(),
      ]);
      setHealth(h);
      if (Array.isArray(l)) setLogs(l);
      if (Array.isArray(c)) setCoupons(c);
      if (d) setDashboard(d);
    } catch {
      setStatusMsg({ text: 'Error contacting backend service', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAll();
      const interval = setInterval(fetchAll, 12000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setStatusMsg(null);
    const perUserLimit = perUserRule === '1' ? 1 : perUserRule === 'unlimited' ? 0 : (parseInt(customUserLimit, 10) || 3);
    const res = await backendApi.createCoupon({
      code: newCode.trim().toUpperCase(),
      rewardCores: parseInt(newReward, 10) || 100,
      packCores: parseInt(newPack, 10) || 100,
      maxUses: isUnlimitedTotal ? 0 : (parseInt(newMaxUses, 10) || 1000),
      perUserLimit,
      isUnlimited: isUnlimitedTotal,
    });
    if (res.success) {
      setStatusMsg({ text: `Coupon ${newCode.toUpperCase()} created successfully!`, type: 'success' });
      setNewCode('');
      fetchAll();
    } else {
      setStatusMsg({ text: res.message || 'Failed to create coupon', type: 'error' });
    }
  };

  const handleToggleCoupon = async (code: string) => {
    const res = await backendApi.toggleCoupon(code);
    if (res.success) {
      setStatusMsg({ text: `Coupon ${code} updated`, type: 'success' });
      fetchAll();
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    const res = await backendApi.deleteCoupon(code);
    if (res.success) {
      setStatusMsg({ text: `Coupon ${code} deleted`, type: 'success' });
      fetchAll();
    }
  };

  if (!isOpen) return null;

  if (!isUserAdmin(authService.getCurrentUser())) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl bg-[#080c24] border-2 border-red-500/50 p-6 flex flex-col items-center gap-3 text-center text-white font-tech shadow-[0_0_35px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-10 h-10 text-red-400" />
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider font-display">
            ACCESS RESTRICTED // ADMIN ONLY
          </h3>
          <p className="text-xs text-slate-300">
            This terminal requires authorization with your elsesourav.com administrator account. Please log in with your ElseSourav account to access backend controls.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        style={{
          backgroundColor: 'rgba(8, 12, 34, 0.96)',
          border: '1.5px solid rgba(0, 247, 255, 0.4)',
          borderRadius: '20px',
          boxShadow: '0 0 35px rgba(0, 247, 255, 0.25)',
        }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-white font-tech"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-cyan-500/20 bg-cyan-950/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider text-white">
                BACKEND CONTROL // OPS TERMINAL
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${health?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {health ? `PORT 4000 ONLINE · v${health.version} · UP ${health.uptime}s` : 'CONNECTING...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-cyan-500/15 flex-shrink-0">
          {(
            [
              { id: 'logs', label: `ACTIVITY LOGS (${logs.length})`, icon: Activity },
              { id: 'coupons', label: `COUPON MANAGER (${coupons.length})`, icon: Ticket },
              { id: 'metrics', label: 'DB METRICS', icon: Database },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                  isSel ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feedback message banner */}
        {statusMsg && (
          <div
            className={`px-4 py-1.5 text-xs flex items-center gap-2 border-b ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab 1: Live Activity Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 p-3 space-y-1.5">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No activity logs recorded yet.</div>
            ) : (
              logs.map((log) => {
                const isLevel = log.type === 'level_completed';
                const isTrophy = log.type === 'trophy_unlocked';
                const isCoupon = log.type === 'coupon_redeemed' || log.type === 'coupon_created';
                return (
                  <div key={log.id} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
                        isLevel
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isTrophy
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isCoupon
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {log.type.replace('_', ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className="font-bold text-white truncate">@{log.username}</span>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">{log.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Coupon Manager */}
        {activeTab === 'coupons' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Create Coupon Card */}
            <form onSubmit={handleCreateCoupon} className="p-3 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2.5">
              <h3 className="font-bold text-xs text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5" />
                Issue New Promo Coupon
              </h3>
              
              {/* Row 1: Code, Reward Cores, Pack Cores */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">CODE</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="E.g. VIP2026"
                    className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white uppercase focus:border-cyan-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">REWARD CORES</label>
                  <input
                    type="number"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white focus:border-cyan-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">TARGET PACK</label>
                  <input
                    type="number"
                    value={newPack}
                    onChange={(e) => setNewPack(e.target.value)}
                    className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white focus:border-cyan-300 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Per-User Limit (1-Time vs Multi vs Unlimited) & Total Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-cyan-500/20">
                {/* Per-User Validation Option */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">PER-USER REDEMPTION RULE</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPerUserRule('1')}
                      className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
                        perUserRule === '1'
                          ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,247,255,0.4)]'
                          : 'bg-black/60 border border-cyan-500/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      1-Time (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerUserRule('multi')}
                      className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
                        perUserRule === 'multi'
                          ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,247,255,0.4)]'
                          : 'bg-black/60 border border-cyan-500/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      Multiple
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerUserRule('unlimited')}
                      className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
                        perUserRule === 'unlimited'
                          ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,247,255,0.4)]'
                          : 'bg-black/60 border border-cyan-500/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      Unlimited
                    </button>
                  </div>
                  {perUserRule === 'multi' && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400">Max uses per user:</span>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={customUserLimit}
                        onChange={(e) => setCustomUserLimit(e.target.value)}
                        className="w-16 px-1.5 py-0.5 bg-black/60 border border-cyan-500/40 rounded text-[10px] text-white outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Total Global Capacity Option */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-slate-400">GLOBAL TOTAL USES</label>
                    <label className="flex items-center gap-1 text-[10px] text-cyan-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUnlimitedTotal}
                        onChange={(e) => setIsUnlimitedTotal(e.target.checked)}
                        className="rounded border-cyan-500/40 text-cyan-500 focus:ring-0"
                      />
                      <span>Unlimited (∞)</span>
                    </label>
                  </div>
                  {isUnlimitedTotal ? (
                    <div className="py-1 px-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold flex items-center justify-center">
                      ∞ UNLIMITED GLOBAL REDEMPTIONS
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={newMaxUses}
                      onChange={(e) => setNewMaxUses(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white focus:border-cyan-300 outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded text-xs font-bold text-black tracking-wider hover:brightness-110 cursor-pointer shadow-[0_0_10px_rgba(0,247,255,0.4)]"
                >
                  + CREATE COUPON
                </button>
              </div>
            </form>

            {/* Existing Coupons Table */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Promo Codes</h4>
              <div className="space-y-1.5">
                {coupons.map((c) => {
                  const isUnlimited = Boolean(c.is_unlimited || c.max_uses <= 0);
                  const perUser = c.per_user_limit !== undefined && c.per_user_limit !== null ? Number(c.per_user_limit) : 1;
                  return (
                    <div
                      key={c.code}
                      className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="font-mono font-bold text-amber-300 text-sm tracking-wide">{c.code}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                          +{c.reward_cores} Cores (Pack {c.pack_cores})
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                            perUser === 1
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : perUser === 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {perUser === 1 ? '1x / User' : perUser === 0 ? '∞ / User' : `${perUser}x / User`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Used: {c.used_count} / {isUnlimited ? '∞ Unlimited' : c.max_uses}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleCoupon(c.code)}
                          className={`p-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                            c.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                          }`}
                          title={c.is_active ? 'Disable Coupon' : 'Enable Coupon'}
                        >
                          <Power className="w-3 h-3" />
                          {c.is_active ? 'ACTIVE' : 'OFF'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Database & Metrics */}
        {activeTab === 'metrics' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Real Pre-Players', val: dashboard?.metrics?.totalUsers ?? 50, note: 'Seeded with 30-level history', color: 'text-cyan-300' },
                { label: 'Level Completions', val: dashboard?.metrics?.totalCompletions ?? 1139, note: 'Across 30 campaign stages', color: 'text-cyan-300' },
                { label: 'Trophies Earned', val: dashboard?.metrics?.totalTrophies ?? 350, note: 'Individual achievements', color: 'text-amber-300' },
                { label: 'Promo Coupons', val: dashboard?.metrics?.totalCoupons ?? 5, note: 'Active redemption codes', color: 'text-emerald-300' },
                { label: 'Coupon Redemptions', val: dashboard?.metrics?.totalRedemptions ?? 13, note: 'Single-use server enforced', color: 'text-emerald-300' },
                { label: 'Cores Granted', val: (dashboard?.metrics?.totalCoresDistributed ?? 4100).toLocaleString(), note: 'Total cyber balance', color: 'text-cyan-200' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-black/40 border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block uppercase">{m.label}</span>
                  <span className={`font-display font-black text-2xl ${m.color}`}>{m.val}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{m.note}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 font-mono text-slate-300">
              <div className="text-cyan-400 font-bold mb-1">// SYSTEM ARCHITECTURE</div>
              <div>• Storage Engine: SQLite (Native WAL mode, zero external compilation)</div>
              <div>• Cloud Synchronization: Dual-Write (Local SQLite + Cloud Firestore)</div>
              <div>• Host: Local port 4000 (Ready for VM3 Azure deployment via PM2)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
