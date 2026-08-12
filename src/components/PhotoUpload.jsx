import { useRef } from "react";
import { Camera, Image as ImageIcon, Plus, X } from "lucide-react";

export default function PhotoUpload({ photo, onPhoto }) {
  const galleryRef = useRef();
  const cameraRef  = useRef();

  const readFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const SZ = 800;
        let { width, height } = img;
        if (width > SZ || height > SZ) {
          if (width > height) { height = Math.round((height * SZ) / width); width = SZ; }
          else { width = Math.round((width * SZ) / height); height = SZ; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        onPhoto(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mb-2">
      {photo ? (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[#F3E7DC]">
          <img src={photo} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onPhoto(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => galleryRef.current?.click()}
          className="w-full h-40 rounded-2xl border-2 border-dashed border-[#E3D5C4] bg-[#F3E7DC] flex flex-col items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={26} className="text-[#A93446] opacity-60" />
          <span className="text-[11px] font-bold text-[#A93446]">Rasm qo'shish</span>
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" onChange={readFile} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={readFile} className="hidden" />

      <div className="flex gap-2 mt-2.5">
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-[#E3D5C4] bg-[#F3E7DC] text-[#4A2E22] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ImageIcon size={15} /> Galereya
        </button>
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-[#E3D5C4] bg-[#F3E7DC] text-[#4A2E22] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Camera size={15} /> Kamera
        </button>
      </div>
    </div>
  );
}
