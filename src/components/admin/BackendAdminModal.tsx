import React, { useState, useEffect } from 'react';
import { X, Activity, Ticket, Database, CheckCircle, AlertCircle, RefreshCw, Trash2, Power, ShieldAlert, Copy, Search } from 'lucide-react';
import { backendApi, BackendHealthResponse, BackendActivityLog, AdminCoupon } from '../../services/backendApi';
import { authService, isUserAdmin } from '../../services/auth';

interface BackendAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'logs' | 'coupons' | 'metrics';
}

export const BackendAdminModal: React.FC<BackendAdminModalProps> = ({ isOpen, onClose, initialTab = 'coupons' }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'coupons' | 'metrics'>(initialTab);
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [logs, setLogs] = useState<BackendActivityLog[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [couponFilter, setCouponFilter] = useState('');

  // New coupon form state
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState('5000');
  const [newPack, setNewPack] = useState('0');
  const [newMaxUses, setNewMaxUses] = useState('1000');
  const [perUserRule, setPerUserRule] = useState<'1' | 'multi' | 'unlimited'>('1');
  const [customUserLimit, setCustomUserLimit] = useState('3');
  const [isUnlimitedTotal, setIsUnlimitedTotal] = useState(false);

  const fetchAll = async () => {
    const user = authService.getCurrentUser();
    if (!isUserAdmin(user)) return;
    if (!backendApi.hasAdminToken() && user.token) await backendApi.adminLogin(user.token);
    setIsLoading(true);
    try {
      const [h, l, c, d] = await Promise.all([backendApi.checkHealth(), backendApi.getAdminLogs(60), backendApi.getAdminCoupons(), backendApi.getAdminDashboard()]);
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
      if (initialTab) setActiveTab(initialTab);
      fetchAll();
      const interval = setInterval(fetchAll, 12000);
      return () => clearInterval(interval);
    }
  }, [isOpen, initialTab]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setStatusMsg(null);
    const parsedReward = parseInt(newReward, 10);
    if (isNaN(parsedReward)) {
      setStatusMsg({ text: 'Reward cores must be a valid number (e.g. 5000 or -5000)', type: 'error' });
      return;
    }
    const perUserLimit = perUserRule === '1' ? 1 : perUserRule === 'unlimited' ? 0 : (parseInt(customUserLimit, 10) || 3);
    const res = await backendApi.createCoupon({
      code: newCode.trim().toUpperCase(),
      rewardCores: parsedReward,
      packCores: parseInt(newPack, 10) || 0,
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

  const handleToggleCoupon = async (code: string, currentActive: boolean) => {
    const res = await backendApi.toggleCoupon(code, !currentActive);
    if (res.success) { setStatusMsg({ text: `Coupon ${code} set to ${!currentActive ? 'ACTIVE' : 'OFF'}`, type: 'success' }); fetchAll(); }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Permanently remove coupon ${code}?`)) return;
    const res = await backendApi.deleteCoupon(code);
    if (res.success) { setStatusMsg({ text: `Coupon ${code} removed successfully`, type: 'success' }); fetchAll(); }
  };

  if (!isOpen) return null;

  if (!isUserAdmin(authService.getCurrentUser())) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl bg-[#080c24] border-2 border-red-500/50 p-6 flex flex-col items-center gap-3 text-center text-white font-tech">
          <ShieldAlert className="w-10 h-10 text-red-400" />
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider font-display">ACCESS RESTRICTED // ADMIN ONLY</h3>
          <p className="text-xs text-slate-300">This terminal requires authorization with your elsesourav.com administrator account.</p>
          <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white cursor-pointer">DISMISS</button>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">CODE</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="E.g. VIP5000"
                    className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white uppercase focus:border-cyan-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">REWARD CORES (+ / -)</label>
                  <input
                    type="number"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. 5000 or -5000"
                    className="w-full px-2 py-1 bg-black/60 border border-cyan-500/40 rounded text-xs text-white focus:border-cyan-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">TARGET PACK</label>
                  <select
                    value={newPack}
                    onChange={(e) => setNewPack(e.target.value)}
                    className="w-full px-2 py-1 bg-black/80 border border-cyan-500/40 rounded text-xs text-white focus:border-cyan-300 outline-none cursor-pointer"
                  >
                    <option value="0">Universal (Any Pack)</option>
                    <option value="500">500 Cores (Starter)</option>
                    <option value="1000">1,000 Cores (Power)</option>
                    <option value="2500">2,500 Cores (Mega)</option>
                    <option value="5000">5,000 Cores (Ultra)</option>
                    <option value="10000">10,000 Cores (Titan)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Per-User Limit (1-Time vs Multi vs Unlimited) & Total Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-cyan-500/20">
                {/* Per-User Validation Option */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">PER-USER REDEMPTION RULE</label>
                  <div className="flex items-center gap-1">
                    {(['1', 'multi', 'unlimited'] as const).map((rule) => (
                      <button
                        key={rule}
                        type="button"
                        onClick={() => setPerUserRule(rule)}
                        className={`flex-1 py-1 px-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          perUserRule === rule
                            ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,247,255,0.4)]'
                            : 'bg-black/60 border border-cyan-500/30 text-slate-400 hover:text-white'
                        }`}
                      >
                        {rule === '1' ? '1-Time' : rule === 'multi' ? 'Multi' : 'Unlimited'}
                      </button>
                    ))}
                  </div>
                  {perUserRule === 'multi' && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400">Max uses/user:</span>
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
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>Manage Active Coupons</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                    {coupons.length}
                  </span>
                </h4>
                {coupons.length > 3 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter codes..."
                      value={couponFilter}
                      onChange={(e) => setCouponFilter(e.target.value)}
                      className="px-2 py-0.5 pl-5 bg-black/60 border border-cyan-500/30 rounded text-[10px] text-white outline-none w-28 focus:w-36 transition-all"
                    />
                    <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                {coupons.filter(c => c.code.toLowerCase().includes(couponFilter.toLowerCase()) || String(c.pack_cores).includes(couponFilter)).map((c) => {
                  const isUnlimited = Boolean(c.is_unlimited || c.max_uses <= 0);
                  const perUser = c.per_user_limit !== undefined && c.per_user_limit !== null ? Number(c.per_user_limit) : 1;
                  return (
                    <div
                      key={c.code}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                        c.is_active ? 'bg-black/50 border-cyan-500/25' : 'bg-black/30 border-slate-700/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-300 text-sm tracking-wide">{c.code}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(c.code);
                              setStatusMsg({ text: `Copied ${c.code} to clipboard`, type: 'success' });
                            }}
                            className="text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer"
                            title="Copy Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.reward_cores < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {c.reward_cores >= 0 ? `+${c.reward_cores}` : c.reward_cores} Cores ({c.pack_cores === 0 ? 'Universal' : `Pack ${c.pack_cores}`})
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
                          Used: {c.used_count} / {isUnlimited ? '∞' : c.max_uses}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.code, Boolean(c.is_active))}
                          className={`py-1 px-2 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            c.is_active
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title={c.is_active ? 'Click to Disable' : 'Click to Enable'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{c.is_active ? 'ACTIVE' : 'OFF'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="py-1 px-2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 cursor-pointer flex items-center gap-1 text-[10px] font-bold transition-all"
                          title="Remove Coupon Permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>REMOVE</span>
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
                { label: 'Real Pre-Players', val: dashboard?.metrics?.totalUsers ?? 50, note: 'Seeded history', color: 'text-cyan-300' },
                { label: 'Level Completions', val: dashboard?.metrics?.totalCompletions ?? 1139, note: '30 stages', color: 'text-cyan-300' },
                { label: 'Trophies Earned', val: dashboard?.metrics?.totalTrophies ?? 350, note: 'Achievements', color: 'text-amber-300' },
                { label: 'Promo Coupons', val: dashboard?.metrics?.totalCoupons ?? 5, note: 'Redemption codes', color: 'text-emerald-300' },
                { label: 'Coupon Redemptions', val: dashboard?.metrics?.totalRedemptions ?? 13, note: 'Server enforced', color: 'text-emerald-300' },
                { label: 'Cores Granted', val: (dashboard?.metrics?.totalCoresDistributed ?? 4100).toLocaleString(), note: 'Cyber balance', color: 'text-cyan-200' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-black/40 border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block uppercase">{m.label}</span>
                  <span className={`font-display font-black text-2xl ${m.color}`}>{m.val}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{m.note}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300 leading-relaxed">
              <div className="text-cyan-400 font-bold mb-1">// SYSTEM ARCHITECTURE</div>
              <p>• Storage: SQLite (Native WAL) | Cloud Sync: Dual-Write (Firestore) | Host: api.elsesourav.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
