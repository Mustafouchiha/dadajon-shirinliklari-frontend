import { useState } from "react";
import { authAPI, setToken } from "../services/api";
import Logo from "../components/Logo";
import { Smartphone, Loader2, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "Dadajon_Cafebot";
const BOT_URL = `https://t.me/${BOT_USERNAME}`;

function openBot() {
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(BOT_URL);
  } else {
    window.open(BOT_URL, "_blank");
  }
}

function formatPhone(raw) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

export default function LoginPage({ onLogin, appLogo = "" }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const getTgInfo = () => {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return {
      tgChatId: u?.id ? String(u.id) : undefined,
      tgName: u ? [u.first_name, u.last_name].filter(Boolean).join(" ") : "",
      tgHandle: u?.username ? `@${u.username}` : "",
    };
  };

  const withRetry = async (fn, retries = 6) => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (e) {
        if (e.offline && i < retries) {
          setError(`Ulanmoqda... (${i + 1})`);
          await new Promise((r) => setTimeout(r, 4000));
          setError("");
          continue;
        }
        throw e;
      }
    }
  };

  const handleSendCode = async () => {
    setError(""); setInfo("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) { setError("9 xonali telefon raqam kiriting"); return; }
    setLoading(true);
    try {
      const { tgChatId, tgName, tgHandle } = getTgInfo();
      await withRetry(() => authAPI.sendCode({
        phone: digits,
        tgChatId,
        name: tgName || "Foydalanuvchi",
        telegram: tgHandle || undefined,
      }));
      setInfo("✅ Telegram ga 6 xonali kod yuborildi");
      setStep(2);
    } catch (e) {
      if (e.offline) {
        setError("Server vaqtincha ishlamayapti. Bir oz kuting va qayta urining.");
      } else if (e.needBot || (e.message || "").toLowerCase().includes("bot")) {
        setError(`Avval @${BOT_USERNAME} ga /start yuboring, keyin qaytib keling.`);
      } else {
        setError(e.message || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    if (code.trim().length !== 6) { setError("6 xonali kod kiriting"); return; }
    setLoading(true);
    try {
      const { tgChatId } = getTgInfo();
      const data = await withRetry(() => authAPI.login({
        phone: phone.replace(/\D/g, ""),
        code: code.trim(),
        tgChatId,
      }));
      setToken(data.token);
      localStorage.setItem("dt_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(e.offline ? "Server javob bermadi. Qayta urinib ko'ring." : (e.message || "Xatolik yuz berdi"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center px-5 py-8 bg-[#FBF6EF]">
      <div className="mb-3"><Logo size={72} src={appLogo} /></div>
      <div className="text-[26px] font-black text-[#4A2E22] mb-0.5">Dadajon Tort</div>
      <div className="text-[12px] text-[#9C8778] mb-6 text-center">Mazali tortlar va shirinliklar</div>

      <div className="w-full bg-white rounded-[22px] border border-[#F0E4D6] overflow-hidden shadow-[0_4px_22px_rgba(0,0,0,0.08)]">
        <div className="p-5">
          {step === 1 && (
            <>
              <div className="text-xs font-bold text-[#9C8778] mb-1.5">Telefon raqam *</div>
              <PhoneInput value={phone} onChange={setPhone} onEnter={handleSendCode} />

              {error && <ErrorBox msg={error} />}

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-3 rounded-[13px] text-[13px] font-bold text-white flex items-center justify-center gap-1.5 bg-[#A93446] disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> {error ? "Qayta urinilmoqda..." : "Yuborilmoqda..."}</>
                  : <><Smartphone size={14} /> Telegram ga kod yuborish</>}
              </button>

              <div className="mt-4 p-3 rounded-[13px] bg-[#E8F6FD] border border-[#BDE3F8] flex items-center gap-2.5">
                <span className="text-xl">💬</span>
                <div className="flex-1">
                  <div className="text-xs font-black text-[#0088CC] mb-0.5">Telegram bot orqali ham kirish mumkin</div>
                  <button onClick={openBot} className="text-[11px] text-[#0088CC] font-bold underline">
                    @{BOT_USERNAME} → /start
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => { setStep(1); setCode(""); setError(""); setInfo(""); }}
                className="flex items-center gap-1.5 text-[#9C8778] text-xs font-bold mb-4"
              >
                <ArrowLeft size={13} /> Orqaga
              </button>

              <div className="text-center mb-5">
                <div className="text-4xl mb-2">📨</div>
                <div className="text-[17px] font-black text-[#4A2E22] mb-1">Telegram kodingizni kiriting</div>
                <div className="text-xs text-[#9C8778] leading-relaxed">@{BOT_USERNAME} dan 6 xonali kod yuborildi</div>
                <div className="mt-2 inline-block bg-[#F3E7DC] border border-[#E3D5C4] rounded-[10px] px-3.5 py-1 text-sm font-black text-[#A93446]">
                  +998 {phone}
                </div>
              </div>

              {info && <div className="mb-3 px-3 py-2 rounded-[10px] bg-green-50 text-green-700 text-xs font-semibold">{info}</div>}

              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                inputMode="numeric"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className={`w-full p-4 rounded-2xl mb-3.5 border-[2.5px] bg-[#FBF6EF] text-[32px] font-black tracking-[10px] text-center text-[#4A2E22] outline-none ${
                  code.length >= 6 ? "border-[#4A2E22]" : "border-[#E3D5C4]"
                }`}
              />

              {error && <ErrorBox msg={error} />}

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 rounded-[13px] text-[13px] font-bold text-white flex items-center justify-center gap-1.5 bg-[#A93446] disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> {error ? "Qayta urinilmoqda..." : "Tekshirilmoqda..."}</>
                  : <><KeyRound size={14} /> Tasdiqlash va kirish</>}
              </button>

              <div className="text-center mt-3 text-[11px] text-[#9C8778]">
                Kod kelmadimi?{" "}
                <span onClick={() => { setStep(1); setCode(""); setError(""); }} className="text-[#A93446] font-bold cursor-pointer">
                  Qayta yuborish
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneInput({ value, onChange, onEnter }) {
  return (
    <div className="relative mb-3">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#9C8778] font-bold select-none pointer-events-none">
        +998
      </span>
      <input
        value={value}
        inputMode="numeric"
        placeholder="90 000 00 00"
        onChange={(e) => onChange(formatPhone(e.target.value))}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="w-full py-2.5 pl-[54px] pr-3.5 rounded-xl border border-[#F0E4D6] text-[15px] text-[#4A2E22] outline-none bg-[#FBF6EF] tracking-wide focus:border-[#A93446]"
      />
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="px-3.5 py-2.5 rounded-[10px] mb-3 bg-red-50 text-red-500 text-xs font-semibold flex items-center gap-1.5">
      <AlertTriangle size={13} /> {msg}
    </div>
  );
}
