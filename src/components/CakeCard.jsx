import { CakeSlice, Plus } from "lucide-react";
import { fmt } from "../constants";

function CakeThumb({ photo, className = "h-24" }) {
  if (photo) {
    return <img src={photo} alt="" className={`w-full ${className} rounded-2xl object-cover`} />;
  }
  return (
    <div className={`w-full ${className} rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#F1D6C9] to-[#FBF6EF]`}>
      <CakeSlice size={30} strokeWidth={1.6} className="text-[#4A2E22] opacity-55" />
    </div>
  );
}

export default function CakeCard({ product, onAdd }) {
  return (
    <div className="rounded-2xl p-2.5 bg-white shadow-sm">
      <CakeThumb photo={product.photo} />
      <p className="text-[12.5px] font-medium mt-2 leading-snug text-[#4A2E22] line-clamp-2">
        {product.name}
      </p>
      {product.weight && (
        <p className="text-[11px] mt-0.5 text-[#9C8778]">{product.weight}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[12.5px] font-semibold text-[#A93446]">{fmt(product.price)}</span>
        <button
          onClick={() => onAdd(product)}
          className="w-7 h-7 rounded-full bg-[#4A2E22] flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus size={14} className="text-white" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export { CakeThumb };
