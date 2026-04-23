import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_SEND_URL = "https://functions.poehali.dev/b9ec3f6e-4c98-4c13-a016-321a6abd0f4e";
const AUTH_VERIFY_URL = "https://functions.poehali.dev/55a8c544-9a1a-4cc7-90d5-520198debab5";

interface User {
  id: number;
  phone: string;
  name: string | null;
  bonus_points: number;
  level: string;
  is_new: boolean;
}

interface AuthProps {
  onAuth: (user: User, token: string) => void;
}

type Step = "phone" | "code" | "name";

export default function Auth({ onAuth }: AuthProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingToken, setPendingToken] = useState("");
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs[0].current?.focus(), 100);
    }
  }, [step]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 0) return "";
    let d = digits;
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    let result = "+7";
    if (d.length > 1) result += " (" + d.slice(1, 4);
    if (d.length > 4) result += ") " + d.slice(4, 7);
    if (d.length > 7) result += "-" + d.slice(7, 9);
    if (d.length > 9) result += "-" + d.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const rawPhone = () => {
    const d = phone.replace(/\D/g, "");
    return "+" + (d.startsWith("7") ? d : "7" + d);
  };

  const sendCode = async () => {
    const rp = rawPhone();
    if (rp.replace(/\D/g, "").length !== 11) {
      setError("Введите полный номер телефона");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(AUTH_SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка отправки");
        return;
      }
      setStep("code");
      setCountdown(60);
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    setError("");
    if (val && i < 3) codeRefs[i + 1].current?.focus();
    if (next.every(c => c !== "") && val) {
      verifyCode(next.join(""));
    }
  };

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      codeRefs[i - 1].current?.focus();
    }
  };

  const verifyCode = async (codeStr: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(AUTH_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone(), code: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Неверный код");
        setCode(["", "", "", ""]);
        codeRefs[0].current?.focus();
        return;
      }
      const user: User = data.user;
      const token: string = data.token;
      if (user.is_new) {
        setPendingUser(user);
        setPendingToken(token);
        setStep("name");
      } else {
        onAuth(user, token);
      }
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const saveName = () => {
    if (!pendingUser) return;
    const updatedUser = { ...pendingUser, name: userName || null };
    onAuth(updatedUser, pendingToken);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #ffc2d4 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-56 h-56 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #c8dccb 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
      <div className="absolute top-1/3 left-0 w-32 h-32 opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f8d0ea 0%, transparent 70%)" }} />

      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-petal-200 to-bloom-300 flex items-center justify-center mx-auto mb-4 petal-shadow-lg animate-float">
          <span className="text-4xl">🌸</span>
        </div>
        <h1 className="font-display text-4xl font-light text-foreground">Флора</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">цветочный магазин</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-[2rem] p-7 petal-shadow-lg animate-fade-in" style={{ animationDelay: "100ms", opacity: 0 }}>
        {step === "phone" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-light text-foreground">Войти</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Введите номер — пришлём СМС с кодом</p>
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-muted-foreground font-medium">Номер телефона</label>
              <div className="relative">
                <Icon name="Phone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={e => e.key === "Enter" && sendCode()}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-white/80 rounded-2xl pl-10 pr-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-petal-300 transition-all border border-border"
                />
              </div>
              {error && <p className="font-body text-xs text-rose-500 pt-1">{error}</p>}
            </div>

            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full bg-petal-400 hover:bg-petal-500 disabled:opacity-60 text-white rounded-2xl py-3.5 font-body text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98] petal-shadow flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">🌸</span>
              ) : (
                <>Получить код <Icon name="ArrowRight" size={16} /></>
              )}
            </button>

            <p className="font-body text-xs text-muted-foreground text-center">
              Нажимая кнопку, вы соглашаетесь с условиями использования
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-5">
            <div>
              <button onClick={() => { setStep("phone"); setCode(["", "", "", ""]); setError(""); }}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-sm mb-3 transition-colors">
                <Icon name="ArrowLeft" size={15} /> Назад
              </button>
              <h2 className="font-display text-2xl font-light text-foreground">Введите код</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Отправили СМС на <span className="text-foreground font-medium">{phone}</span>
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={codeRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className={`w-14 h-14 text-center font-display text-2xl font-semibold rounded-2xl border-2 outline-none transition-all bg-white/80 ${
                    digit ? "border-petal-400 text-petal-500" : "border-border text-foreground"
                  } focus:border-petal-300 focus:ring-2 focus:ring-petal-200`}
                />
              ))}
            </div>

            {error && <p className="font-body text-xs text-rose-500 text-center">{error}</p>}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-body text-sm">
                <span className="animate-spin text-lg">🌸</span>
                Проверяем код...
              </div>
            )}

            <div className="text-center">
              {countdown > 0 ? (
                <p className="font-body text-sm text-muted-foreground">
                  Повторная отправка через <span className="text-foreground font-medium">{countdown} сек</span>
                </p>
              ) : (
                <button
                  onClick={sendCode}
                  className="font-body text-sm text-petal-400 hover:text-petal-500 font-medium transition-colors"
                >
                  Отправить код повторно
                </button>
              )}
            </div>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-petal-100 flex items-center justify-center mb-3">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="font-display text-2xl font-light text-foreground">Добро пожаловать!</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Как вас зовут? Мы будем обращаться по имени</p>
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-muted-foreground font-medium">Ваше имя</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                placeholder="Например, Анна"
                autoFocus
                className="w-full bg-white/80 rounded-2xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-petal-300 transition-all border border-border"
              />
            </div>

            <button
              onClick={saveName}
              className="w-full bg-petal-400 hover:bg-petal-500 text-white rounded-2xl py-3.5 font-body text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98] petal-shadow"
            >
              Начать пользоваться
            </button>

            <button
              onClick={() => saveName()}
              className="w-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Пропустить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
