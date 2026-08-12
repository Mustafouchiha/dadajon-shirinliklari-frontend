import { useState } from "react";
import { ArrowLeft, Store } from "lucide-react";
import { fmt, SHOP_INFO } from "../constants";
import { ordersAPI } from "../services/api";

export default function CheckoutPage({ cart, user, onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const canSubmit = form.name.trim() && form.phone.trim() && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const order = await ordersAPI.create({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        comment: form.comment.trim(),
        items: cart.map((i) => ({ productId: i.id, qty: i.qty })),
      });
      onSuccess(order);
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 pt-5 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F3E7DC]">
          <ArrowLeft size={16} className="text-[#4A2E22]" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#4A2E22]">Rasmiylashtirish</h1>
      </div>

      <div className="space-y-3">
        <input
          placeholder="Ism"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3.5 py-3 rounded-xl text-[13.5px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
        />
        <input
          placeholder="Telefon raqam"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3.5 py-3 rounded-xl text-[13.5px] outline-none bg-[#F3E7DC] text-[#4A2E22]"
        />

        <div className="py-3 px-3.5 rounded-xl flex items-center gap-3 bg-[#4A2E22]">
          <Store size={17} className="text-white" strokeWidth={1.8} />
          <div>
            <div className="text-[12.5px] font-semibold text-white">Do'kondan olib ketish</div>
            <div className="text-[11px] text-white/70">{SHOP_INFO.address} • {SHOP_INFO.hours}</div>
          </div>
        </div>

        <textarea
          placeholder="Izoh (ixtiyoriy)"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={2}
          className="w-full px-3.5 py-3 rounded-xl text-[13.5px] outline-none resize-none bg-[#F3E7DC] text-[#4A2E22]"
        />
      </div>

      {error && (
        <div className="mt-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium bg-red-50 text-red-500">
          {error}
        </div>
      )}

      <div className="mt-5 pt-4 space-y-1.5 border-t border-dashed border-[#E3D5C4]">
        <div className="flex justify-between text-[15px] font-semibold text-[#4A2E22]">
          <span>Jami</span>
          <span>{fmt(total)}</span>
        </div>
        <div className="text-[11px] text-[#9C8778]">To'lov do'konda olib ketishda naqd yoki karta orqali</div>
      </div>

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="mt-4 w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40 bg-[#A93446]"
      >
        {loading ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
      </button>
    </div>
  );
}
