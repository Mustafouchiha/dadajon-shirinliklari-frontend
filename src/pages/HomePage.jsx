import { User, ChevronRight, CakeSlice, Cookie, Croissant, Sparkles, Gift } from "lucide-react";
import { CATEGORIES } from "../constants";
import CakeCard from "../components/CakeCard";

const CAT_ICONS = {
  Tortlar: CakeSlice,
  Kapkeyk: Cookie,
  Piroglar: Croissant,
  Shirinliklar: Sparkles,
  Maxsus: Gift,
};

function ScallopDivider() {
  return (
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="w-full h-4 -mt-1">
      <path
        d="M0,0 C10,20 20,20 30,0 C40,20 50,20 60,0 C70,20 80,20 90,0 C100,20 110,20 120,0 C130,20 140,20 150,0 C160,20 170,20 180,0 C190,20 200,20 210,0 C220,20 230,20 240,0 C250,20 260,20 270,0 C280,20 290,20 300,0 C310,20 320,20 330,0 C340,20 350,20 360,0 C370,20 380,20 390,0 C395,10 400,10 400,0 L400,0 L0,0 Z"
        fill="#FBF6EF"
      />
    </svg>
  );
}

export default function HomePage({ user, products, addToCart, goCatalog, goCategory }) {
  const featured = products.filter((p) => p.isFeatured).slice(0, 6);
  const firstName = (user?.name || "").split(" ")[0] || "";

  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-8 rounded-b-[28px]" style={{ background: "linear-gradient(165deg,#4A2E22,#6B4433)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-wide uppercase text-[#E7AFB0]">Xush kelibsiz</p>
            <p className="text-white text-[15px] font-semibold">
              {firstName ? `Salom, ${firstName} 👋` : "Salom 👋"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/12">
            <User size={18} strokeWidth={1.8} className="text-white" />
          </div>
        </div>
        <p className="uppercase tracking-[0.18em] text-[11px] text-[#E7AFB0]">Dadajon Tort</p>
        <h1 className="text-white text-[28px] leading-[1.15] mt-1 font-semibold">
          Mazali tortlar
          <br />
          Asakada&nbsp;❤️
        </h1>
        <button
          onClick={goCatalog}
          className="mt-5 px-5 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-transform bg-[#A93446] text-white"
        >
          Buyurtma berish <ChevronRight size={16} />
        </button>
      </div>
      <ScallopDivider />

      <div className="px-5 mt-2">
        <h2 className="text-[15px] font-semibold text-[#4A2E22] mb-3">Kategoriyalar</h2>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = CAT_ICONS[cat] || CakeSlice;
            return (
              <button
                key={cat}
                onClick={() => goCategory(cat)}
                className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F3E7DC]">
                  <Icon size={22} strokeWidth={1.8} className="text-[#4A2E22]" />
                </div>
                <span className="text-[11px] text-[#7A6656]">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-[#4A2E22]">Mashhur mahsulotlar</h2>
          <button onClick={goCatalog} className="text-[12px] text-[#A93446]">Barchasi</button>
        </div>
        {featured.length === 0 ? (
          <p className="text-center text-[13px] py-8 text-[#9C8778]">Hozircha mahsulot yo'q</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <CakeCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
