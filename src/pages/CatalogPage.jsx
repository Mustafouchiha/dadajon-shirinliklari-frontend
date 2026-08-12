import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "../constants";
import CakeCard from "../components/CakeCard";

export default function CatalogPage({ products, addToCart, initialCategory }) {
  const [activeCat, setActiveCat] = useState(initialCategory || null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCat ? p.category === activeCat : true;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, activeCat, query]);

  return (
    <div className="px-5 pt-5 pb-4">
      <h1 className="text-[20px] font-semibold mb-3 text-[#4A2E22]">Katalog</h1>

      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4 bg-[#F3E7DC]">
        <Search size={16} strokeWidth={1.8} className="text-[#9C8778]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mahsulot qidirish..."
          className="bg-transparent outline-none text-[13.5px] flex-1 text-[#4A2E22]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        <button
          onClick={() => setActiveCat(null)}
          className={`px-3.5 py-1.5 rounded-full text-[12.5px] shrink-0 transition-colors ${
            activeCat === null ? "bg-[#4A2E22] text-white" : "bg-[#F3E7DC] text-[#4A2E22]"
          }`}
        >
          Barchasi
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] shrink-0 transition-colors ${
              activeCat === cat ? "bg-[#4A2E22] text-white" : "bg-[#F3E7DC] text-[#4A2E22]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <CakeCard key={p.id} product={p} onAdd={addToCart} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-[13px] py-10 text-[#9C8778]">Hech narsa topilmadi</p>
        )}
      </div>
    </div>
  );
}
