import { ShoppingCart, Plus, Minus } from "lucide-react";
import { fmt, SHOP_INFO } from "../constants";
import { CakeThumb } from "../components/CakeCard";

export default function CartPage({ cart, updateQty, goCatalog, goCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="px-5 pt-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#F3E7DC]">
          <ShoppingCart size={26} strokeWidth={1.6} className="text-[#9C8778]" />
        </div>
        <p className="text-[14px] font-medium text-[#4A2E22]">Savat hozircha bo'sh</p>
        <p className="text-[12.5px] mt-1 mb-5 text-[#9C8778]">Mazali shirinliklardan birini tanlang ❤️</p>
        <button onClick={goCatalog} className="px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white bg-[#A93446]">
          Katalogni ko'rish
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col h-full">
      <h1 className="text-[20px] font-semibold mb-4 text-[#4A2E22]">Savat</h1>

      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-2.5 shadow-sm">
            <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden">
              <CakeThumb photo={item.photo} className="h-16" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate text-[#4A2E22]">{item.name}</p>
              <p className="text-[12.5px] mt-0.5 text-[#A93446]">{fmt(item.price)}</p>
              <div className="flex items-center gap-2.5 mt-1.5">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F3E7DC]"
                >
                  <Minus size={12} className="text-[#4A2E22]" />
                </button>
                <span className="text-[12.5px] w-4 text-center text-[#4A2E22]">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F3E7DC]"
                >
                  <Plus size={12} className="text-[#4A2E22]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 px-3.5 py-3 rounded-xl bg-[#F3E7DC] text-[12px] text-[#7A6656]">
        🏬 Faqat do'kondan olib ketish — {SHOP_INFO.address}, {SHOP_INFO.hours}
      </div>

      <div className="mt-5 pt-4 space-y-1.5 border-t border-dashed border-[#E3D5C4]">
        <div className="flex justify-between text-[15px] font-semibold text-[#4A2E22]">
          <span>Jami</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <button
        onClick={goCheckout}
        className="mt-4 w-full py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.98] transition-transform bg-[#A93446]"
      >
        Buyurtma berish
      </button>
    </div>
  );
}
