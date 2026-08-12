import { useState, useRef } from "react";
import { Pencil, Image as ImageIcon, Camera, Trash2 } from "lucide-react";

export default function AvatarUpload({ avatar, name, onAvatar }) {
  const galleryRef = useRef();
  const cameraRef  = useRef();
  const [showMenu, setShowMenu] = useState(false);
  const initials = (name || "").trim().split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();

  const readFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        onAvatar(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div
        onClick={() => setShowMenu((m) => !m)}
        className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#E7AFB0] flex items-center justify-center cursor-pointer"
        style={{ background: avatar ? "transparent" : "linear-gradient(135deg,#A93446,#4A2E22)" }}
      >
        {avatar
          ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          : <span className="text-3xl font-black text-white">{initials}</span>}
      </div>

      <div
        onClick={() => setShowMenu((m) => !m)}
        className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full border-[2.5px] border-white text-white cursor-pointer flex items-center justify-center shadow"
        style={{ background: "linear-gradient(135deg,#A93446,#4A2E22)" }}
      >
        <Pencil size={13} />
      </div>

      {showMenu && (
        <div className="absolute top-[106px] left-1/2 -translate-x-1/2 bg-white rounded-2xl py-1.5 shadow-lg border border-[#F0E4D6] z-50 min-w-[160px]">
          {[
            [ImageIcon, "Galereya", () => { galleryRef.current?.click(); setShowMenu(false); }],
            [Camera, "Kamera", () => { cameraRef.current?.click(); setShowMenu(false); }],
            ...(avatar ? [[Trash2, "O'chirish", () => { onAvatar(null); setShowMenu(false); }]] : []),
          ].map(([Icon, lbl, fn]) => (
            <div
              key={lbl}
              onClick={fn}
              className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2 ${lbl === "O'chirish" ? "text-red-500" : "text-[#4A2E22]"}`}
            >
              <Icon size={14} className={lbl === "O'chirish" ? "text-red-500" : "text-[#9C8778]"} />
              {lbl}
            </div>
          ))}
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" onChange={readFile} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={readFile} className="hidden" />
    </div>
  );
}
