import { Phone, MapPin, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { SHOP_INFO } from "../constants";
import AvatarUpload from "../components/AvatarUpload";
import { authAPI } from "../services/api";

export default function ProfilePage({ user, setUser, isOperator, onOpenOperator, onLogout }) {
  const handleAvatar = async (avatar) => {
    try {
      const updated = await authAPI.updateMe({ avatar });
      setUser(updated);
    } catch { /* silent */ }
  };

  const rows = [
    { icon: Phone, label: user.phone ? `+998 ${user.phone}` : "—" },
    { icon: MapPin, label: `${SHOP_INFO.address} • ${SHOP_INFO.hours}` },
  ];

  return (
    <div className="px-5 pt-5 pb-4">
      <div className="flex flex-col items-center pt-4 pb-6">
        <AvatarUpload avatar={user.avatar} name={user.name} onAvatar={handleAvatar} />
        <p className="text-[15px] font-semibold text-[#4A2E22]">{user.name}</p>
        {user.telegram && <p className="text-[12px] text-[#9C8778]">{user.telegram}</p>}
      </div>

      {rows.map((row, i) => {
        const Icon = row.icon;
        return (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 mb-2 shadow-sm">
            <Icon size={17} strokeWidth={1.8} className="text-[#A93446]" />
            <span className="text-[13px] text-[#4A2E22]">{row.label}</span>
          </div>
        );
      })}

      {isOperator && (
        <div
          onClick={onOpenOperator}
          className="flex items-center gap-3 bg-[#4A2E22] rounded-xl px-4 py-3.5 mb-2 shadow-sm cursor-pointer"
        >
          <ShieldCheck size={17} strokeWidth={1.8} className="text-white" />
          <span className="text-[13px] font-semibold text-white">Operator paneli</span>
          <ChevronRight size={15} className="ml-auto text-white/70" />
        </div>
      )}

      <div
        onClick={onLogout}
        className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 mt-4 shadow-sm cursor-pointer"
      >
        <LogOut size={17} strokeWidth={1.8} className="text-red-500" />
        <span className="text-[13px] font-medium text-red-500">Chiqish</span>
      </div>
    </div>
  );
}
