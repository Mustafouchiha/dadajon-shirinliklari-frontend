import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, QrCode as QrIcon, Package, Users, BarChart3,
  Plus, Pencil, Trash2, Check, X, Loader2, UtensilsCrossed,
} from "lucide-react";
import { fmt, ORDER_STATUS } from "../constants";
import { operatorAPI } from "../services/api";
import PhotoUpload from "../components/PhotoUpload";
import { CakeThumb } from "../components/CakeCard";

const TABS = [
  { id: "orders", label: "Buyurtmalar", icon: Package },
  { id: "menu", label: "Menyu", icon: UtensilsCrossed },
  { id: "operators", label: "Operatorlar", icon: Users },
  { id: "stats", label: "Statistika", icon: BarChart3 },
];

export default function OperatorPage({ onBack, user, isMainOperator }) {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen pb-6">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F3E7DC]">
          <ArrowLeft size={16} className="text-[#4A2E22]" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#4A2E22]">Operator paneli</h1>
      </div>

      <div className="flex gap-2 px-5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {TABS.filter((t) => t.id !== "operators" || isMainOperator).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-full text-[12px] font-semibold shrink-0 flex items-center gap-1.5 ${
                active ? "bg-[#4A2E22] text-white" : "bg-[#F3E7DC] text-[#4A2E22]"
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "orders" && <OrdersTab />}
      {tab === "menu" && <MenuTab />}
      {tab === "operators" && isMainOperator && <OperatorsTab />}
      {tab === "stats" && <StatsTab />}
    </div>
  );
}

// ── Buyurtmalar + QR skanerlash ──────────────────────────────────
function OrdersTab() {
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null); // { ok, message, order }
  const [scanning, setScanning] = useState(false);

  const hasTgScanner = typeof window.Telegram?.WebApp?.showScanQrPopup === "function";

  const load = useCallback(() => {
    setLoading(true);
    operatorAPI.getOrders(status).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleCode = async (rawCode) => {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await operatorAPI.pickup(code);
      setScanResult({ ok: true, message: res.message, order: res.order });
    } catch (e) {
      setScanResult({ ok: false, message: e.message || "Xatolik" });
    } finally {
      setScanning(false);
      setManualCode("");
      load();
    }
  };

  const openScanner = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.showScanQrPopup) return;
    tg.showScanQrPopup({ text: "Mijoz QR kodini skanerlang" }, (text) => {
      handleCode(text);
      tg.closeScanQrPopup?.();
      return true;
    });
  };

  const markReady = async (code) => {
    try {
      await operatorAPI.markReady(code);
      load();
    } catch { /* silent */ }
  };

  return (
    <div className="px-5">
      <div className="bg-[#4A2E22] rounded-2xl p-4 mb-4">
        {hasTgScanner ? (
          <button
            onClick={openScanner}
            className="w-full py-3 rounded-xl bg-[#A93446] text-white text-[13.5px] font-bold flex items-center justify-center gap-2"
          >
            <QrIcon size={17} /> QR skanerlash
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleCode(manualCode)}
              placeholder="Buyurtma kodi (masalan A7K2M9)"
              className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none bg-white/95 text-[#4A2E22]"
            />
            <button
              onClick={() => handleCode(manualCode)}
              disabled={scanning}
              className="px-4 rounded-xl bg-[#A93446] text-white text-[12.5px] font-bold"
            >
              {scanning ? <Loader2 size={15} className="animate-spin" /> : "Tekshirish"}
            </button>
          </div>
        )}
        {!hasTgScanner && (
          <p className="text-[10.5px] text-white/60 mt-2">
            Telegram ichida ochilganda kamera bilan QR skaner avtomatik ishlaydi
          </p>
        )}
      </div>

      {scanResult && (
        <div className={`mb-4 p-3.5 rounded-2xl text-[12.5px] font-medium ${scanResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            {scanResult.ok ? <Check size={15} /> : <X size={15} />} {scanResult.message}
          </div>
          {scanResult.order && (
            <div className="text-[11.5px] opacity-80">
              №{scanResult.order.order_code || scanResult.order.orderCode} — {scanResult.order.items?.map((it) => `${it.name} × ${it.qty}`).join(", ")}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {["", "new", "ready", "picked_up", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold shrink-0 ${
              status === s ? "bg-[#4A2E22] text-white" : "bg-[#F3E7DC] text-[#4A2E22]"
            }`}
          >
            {s ? ORDER_STATUS[s]?.label : "Barchasi"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-[13px] text-[#9C8778] py-8">Yuklanmoqda...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-[13px] text-[#9C8778] py-8">Buyurtma yo'q</p>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => {
            const st = ORDER_STATUS[o.status] || ORDER_STATUS.new;
            return (
              <div key={o.orderCode} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[#4A2E22]">№{o.orderCode}</span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
                <div className="text-[11.5px] text-[#9C8778] mb-1">{o.customerName} • {o.customerPhone}</div>
                <div className="text-[11.5px] text-[#7A6656] mb-2">
                  {o.items.map((it) => `${it.name} × ${it.qty}`).join(", ")}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-[#A93446]">{fmt(o.total)}</span>
                  {o.status === "new" && (
                    <button
                      onClick={() => markReady(o.orderCode)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#F3E7DC] text-[#4A2E22]"
                    >
                      Tayyor deb belgilash
                    </button>
                  )}
                  {o.status === "picked_up" && o.pickedUpByName && (
                    <span className="text-[10.5px] text-[#9C8778]">{o.pickedUpByName}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Menyu boshqaruvi ─────────────────────────────────────────────
const EMPTY_FORM = { name: "", category: "Tortlar", price: "", weight: "", photo: null, description: "", isFeatured: false };

function MenuTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    operatorAPI.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY_FORM); setEditing("new"); };
  const openEdit = (p) => {
    setForm({ name: p.name, category: p.category, price: p.price, weight: p.weight, photo: p.photo, description: p.description, isFeatured: p.isFeatured });
    setEditing(p);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      if (editing === "new") {
        await operatorAPI.createProduct(form);
      } else {
        await operatorAPI.updateProduct(editing.id, form);
      }
      setEditing(null);
      load();
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    await operatorAPI.toggleActive(p.id).catch(() => {});
    load();
  };

  const remove = async (p) => {
    await operatorAPI.deleteProduct(p.id).catch(() => {});
    load();
  };

  if (editing) {
    return (
      <div className="px-5">
        <h2 className="text-[15px] font-semibold text-[#4A2E22] mb-3">
          {editing === "new" ? "Yangi mahsulot" : "Mahsulotni tahrirlash"}
        </h2>
        <PhotoUpload photo={form.photo} onPhoto={(photo) => setForm({ ...form, photo })} />
        <div className="space-y-2.5 mt-2">
          <input
            placeholder="Nomi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
          >
            {["Tortlar", "Kapkeyk", "Piroglar", "Shirinliklar", "Maxsus"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-2.5">
            <input
              placeholder="Narxi"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
            />
            <input
              placeholder="Og'irligi (masalan 1.0 kg)"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
            />
          </div>
          <textarea
            placeholder="Tavsif (ixtiyoriy)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none resize-none bg-[#F3E7DC] text-[#4A2E22]"
          />
          <label className="flex items-center gap-2 text-[12.5px] text-[#4A2E22] font-medium">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Bosh sahifada ko'rsatish (mashhur)
          </label>
        </div>
        <div className="flex gap-2.5 mt-4">
          <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold bg-[#F3E7DC] text-[#4A2E22]">
            Bekor qilish
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold text-white bg-[#A93446] disabled:opacity-50"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5">
      <button
        onClick={openNew}
        className="w-full py-2.5 rounded-xl text-[12.5px] font-bold text-white bg-[#A93446] flex items-center justify-center gap-1.5 mb-4"
      >
        <Plus size={15} /> Yangi mahsulot qo'shish
      </button>

      {loading ? (
        <p className="text-center text-[13px] text-[#9C8778] py-8">Yuklanmoqda...</p>
      ) : (
        <div className="space-y-2.5">
          {products.map((p) => (
            <div key={p.id} className="flex gap-3 bg-white rounded-2xl p-2.5 shadow-sm">
              <div className="w-16 h-16 shrink-0 overflow-hidden rounded-xl">
                <CakeThumb photo={p.photo} className="h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-[#4A2E22] truncate">{p.name}</p>
                <p className="text-[11px] text-[#9C8778]">{p.category} • {fmt(p.price)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={() => openEdit(p)} className="w-6 h-6 rounded-full bg-[#F3E7DC] flex items-center justify-center">
                    <Pencil size={11} className="text-[#4A2E22]" />
                  </button>
                  <button onClick={() => toggleActive(p)} className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: p.isActive ? "#E8F8F0" : "#F3E7DC", color: p.isActive ? "#28A869" : "#9C8778" }}>
                    {p.isActive ? "Faol" : "Nofaol"}
                  </button>
                  <button onClick={() => remove(p)} className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center ml-auto">
                    <Trash2 size={11} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Operatorlar ───────────────────────────────────────────────────
function OperatorsTab() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    operatorAPI.getOperators().then(setOperators).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!identifier.trim()) return;
    setError("");
    try {
      await operatorAPI.addOperator(identifier.trim());
      setIdentifier("");
      load();
    } catch (e) {
      setError(e.message || "Xatolik");
    }
  };

  const remove = async (id) => {
    await operatorAPI.removeOperator(id).catch(() => {});
    load();
  };

  return (
    <div className="px-5">
      <div className="flex gap-2 mb-2">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Telefon yoki ism"
          className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
        />
        <button onClick={add} className="px-4 rounded-xl text-[12.5px] font-bold text-white bg-[#A93446]">
          Qo'shish
        </button>
      </div>
      {error && <p className="text-[11.5px] text-red-500 mb-2">{error}</p>}

      {loading ? (
        <p className="text-center text-[13px] text-[#9C8778] py-8">Yuklanmoqda...</p>
      ) : (
        <div className="space-y-2 mt-3">
          {operators.map((o) => (
            <div key={o.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#4A2E22]">{o.name}</p>
                <p className="text-[11px] text-[#9C8778]">+998 {o.phone}</p>
              </div>
              <button onClick={() => remove(o.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={13} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Statistika ───────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    operatorAPI.getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p className="text-center text-[13px] text-[#9C8778] py-8">Yuklanmoqda...</p>;

  const items = [
    ["Foydalanuvchilar", stats.total_users],
    ["Faol mahsulotlar", stats.active_products],
    ["Yangi buyurtmalar", stats.new_orders],
    ["Tayyor buyurtmalar", stats.ready_orders],
    ["Bugun berilgan", stats.picked_up_today],
    ["Bugungi tushum", fmt(stats.revenue_today)],
  ];

  return (
    <div className="px-5 grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] text-[#9C8778] mb-1">{label}</p>
          <p className="text-[18px] font-bold text-[#4A2E22]">{value}</p>
        </div>
      ))}
    </div>
  );
}
