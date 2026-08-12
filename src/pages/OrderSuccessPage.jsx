import { Check } from "lucide-react";
import QrCode from "../components/QrCode";

export default function OrderSuccessPage({ order, onDone }) {
  return (
    <div className="px-6 pt-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-[#4A2E22]">
        <Check size={28} className="text-white" strokeWidth={2.4} />
      </div>
      <h1 className="text-[19px] font-semibold text-[#4A2E22]">Buyurtma qabul qilindi!</h1>
      <p className="text-[13px] mt-1.5 text-[#9C8778]">Buyurtma kodi: {order.orderCode}</p>

      <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm">
        <QrCode value={order.orderCode} size={190} />
      </div>
      <p className="text-[11.5px] mt-3 text-[#9C8778] max-w-[260px]">
        Buyurtmangiz tayyor bo'lganda xabar beramiz. Do'konga kelganingizda shu QR kodni operatorga ko'rsating.
      </p>

      <div className="mt-5 px-4 py-2 rounded-full text-[12.5px] font-medium bg-[#F3E7DC] text-[#4A2E22]">
        Holati: Yangi
      </div>

      <button onClick={onDone} className="mt-8 px-6 py-3 rounded-xl text-[13.5px] font-semibold text-white bg-[#A93446]">
        Bosh sahifaga qaytish
      </button>
    </div>
  );
}
