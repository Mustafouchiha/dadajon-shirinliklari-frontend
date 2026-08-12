import { useEffect, useState } from "react";
import { Check, CakeSlice, Package, Clock } from "lucide-react";
import { fmt } from "../constants";
import { ordersAPI } from "../services/api";
import QrCode from "../components/QrCode";

const STAGES = [
  { key: "new", label: "Yangi" },
  { key: "ready", label: "Tayyor" },
  { key: "picked_up", label: "Berildi" },
];

function stageIndex(status) {
  const i = STAGES.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block bg-red-50 text-red-500">
        Bekor qilingan
      </div>
    );
  }
  const idx = stageIndex(status);
  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => (
        <div key={stage.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center" style={{ width: 56 }}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                i <= idx ? "bg-[#A93446]" : "bg-[#F3E7DC]"
              }`}
            >
              {i <= idx ? <Check size={13} className="text-white" strokeWidth={2.4} /> : <CakeSlice size={13} className="text-[#C4B2A0]" strokeWidth={1.8} />}
            </div>
            <span className={`text-[9px] mt-1 text-center leading-tight ${i <= idx ? "text-[#4A2E22]" : "text-[#C4B2A0]"}`}>
              {stage.label}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={`flex-1 h-[2px] -mt-4 ${i < idx ? "bg-[#A93446]" : "bg-[#F3E7DC]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrOrder, setQrOrder] = useState(null);

  useEffect(() => {
    ordersAPI.getMy().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="px-5 pt-10 text-center text-[13px] text-[#9C8778]">Yuklanmoqda...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="px-5 pt-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#F3E7DC]">
          <Package size={26} strokeWidth={1.6} className="text-[#9C8778]" />
        </div>
        <p className="text-[14px] font-medium text-[#4A2E22]">Hali buyurtma yo'q</p>
        <p className="text-[12.5px] mt-1 text-[#9C8778]">Katalogdan tort tanlab buyurtma bering</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-4">
      <h1 className="text-[20px] font-semibold mb-4 text-[#4A2E22]">Buyurtmalarim</h1>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.orderCode} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13.5px] font-semibold text-[#4A2E22]">Buyurtma №{o.orderCode}</p>
              <span className="text-[11px] flex items-center gap-1 text-[#9C8778]">
                <Clock size={12} /> {new Date(o.createdAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-[12px] mb-4 text-[#9C8778]">
              {o.items.map((it) => `${it.name} × ${it.qty}`).join(", ")}
            </p>

            <OrderProgress status={o.status} />

            {(o.status === "new" || o.status === "ready") && (
              <button
                onClick={() => setQrOrder(o)}
                className="w-full mt-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-white bg-[#4A2E22]"
              >
                QR kodni ko'rsatish
              </button>
            )}

            {o.status === "picked_up" && o.pickedUpByName && (
              <div className="mt-4 pt-3 border-t border-dashed border-[#E3D5C4] text-[11.5px] text-[#7A6656]">
                ✅ {o.pickedUpByName} tomonidan berildi
                {o.pickedUpAt && ` • ${new Date(o.pickedUpAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-[#E3D5C4]">
              <span className="text-[12px] text-[#9C8778]">Jami</span>
              <span className="text-[14px] font-semibold text-[#4A2E22]">{fmt(o.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {qrOrder && (
        <div
          onClick={() => setQrOrder(null)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 flex flex-col items-center mx-6">
            <p className="text-[13px] font-semibold text-[#4A2E22] mb-4">Buyurtma №{qrOrder.orderCode}</p>
            <QrCode value={qrOrder.orderCode} size={220} />
            <p className="text-[11.5px] mt-4 text-[#9C8778] text-center max-w-[220px]">
              Do'konda operatorga shu QR kodni ko'rsating
            </p>
            <button
              onClick={() => setQrOrder(null)}
              className="mt-5 px-5 py-2 rounded-xl text-[12.5px] font-semibold text-white bg-[#A93446]"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
