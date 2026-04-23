import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const FLOWER_IMG_1 = "https://cdn.poehali.dev/projects/c1708797-cbbe-42bc-9c90-7abc52411565/files/4ce2c3e1-bac8-4ffc-b282-7e494c1eea6f.jpg";
const FLOWER_IMG_2 = "https://cdn.poehali.dev/projects/c1708797-cbbe-42bc-9c90-7abc52411565/files/02795f22-0549-4bc7-9544-b646b6ce6d9a.jpg";
const FLOWER_IMG_3 = "https://cdn.poehali.dev/projects/c1708797-cbbe-42bc-9c90-7abc52411565/files/980bfb5d-d984-4e7b-9d3e-593844dc9343.jpg";

const CATALOG = [
  { id: 1, name: "Пионовая нежность", price: 3200, oldPrice: 3800, img: FLOWER_IMG_1, tag: "Хит", desc: "25 пионов, розы, эвкалипт", bonus: 160 },
  { id: 2, name: "Орхидея и лаванда", price: 2800, oldPrice: null, img: FLOWER_IMG_2, tag: "Новинка", desc: "Орхидея, лаванда, зелень", bonus: 140 },
  { id: 3, name: "Весенние тюльпаны", price: 1900, oldPrice: 2200, img: FLOWER_IMG_3, tag: "Акция", desc: "51 тюльпан, крафт, лента", bonus: 95 },
];

const ORDERS = [
  { id: "#4821", date: "18 апр 2026", name: "Пионовая нежность", price: 3200, status: "Доставлен" },
  { id: "#4756", date: "02 апр 2026", name: "Весенние тюльпаны", price: 1900, status: "Доставлен" },
  { id: "#4633", date: "14 мар 2026", name: "Орхидея и лаванда", price: 2800, status: "Доставлен" },
];

const OFFERS = [
  { icon: "Gift", title: "День рождения", desc: "−20% на любой букет в день рождения и 3 дня после", color: "from-petal-100 to-bloom-100", accent: "text-petal-500" },
  { icon: "Repeat2", title: "Второй заказ", desc: "Кешбэк 15% бонусами на второй заказ в месяц", color: "from-bloom-100 to-purple-100", accent: "text-bloom-500" },
  { icon: "Heart", title: "Для подруги", desc: "Скидка 500 ₽ при покупке от 3 000 ₽ по промокоду ПОДРУГА", color: "from-rose-100 to-petal-100", accent: "text-rose-400" },
];

const STORES = [
  { name: "Флора на Арбате", addr: "ул. Арбат, 24", phone: "+7 (495) 123-45-67", hours: "Пн–Вс 8:00–22:00" },
  { name: "Флора в Сити", addr: "Пресненская наб., 8", phone: "+7 (495) 987-65-43", hours: "Пн–Пт 9:00–21:00" },
];

type Tab = "home" | "catalog" | "orders" | "bonus" | "profile";

interface AppUser {
  id: number;
  phone: string;
  name: string | null;
  bonus_points: number;
  level: string;
  is_new: boolean;
}

interface IndexProps {
  user?: AppUser;
  token?: string;
  onLogout?: () => void;
}

export default function Index({ user, onLogout }: IndexProps) {
  const [tab, setTab] = useState<Tab>("home");
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const addToCart = (id: number, name: string) => {
    setCartItems(prev => [...prev, id]);
    setNotification(`${name} добавлен в корзину`);
    setTimeout(() => setNotification(null), 2500);
  };

  const displayName = user?.name || user?.phone || "Гость";
  const bonusPoints = user?.bonus_points ?? 1240;
  const nextLevel = 2000;
  const levelName = "Серебряный";
  const nextLevelName = "Золотой";

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f9688f 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="fixed bottom-20 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #9fc2a4 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      {/* Toast notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-5 py-3 petal-shadow animate-scale-in flex items-center gap-2">
          <span>🌸</span>
          <span className="text-sm font-body text-foreground">{notification}</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {tab === "home" && <HomeTab onTabChange={setTab} displayName={displayName} bonusPoints={bonusPoints} phone={user?.phone} />}
        {tab === "catalog" && <CatalogTab onAdd={addToCart} />}
        {tab === "orders" && <OrdersTab />}
        {tab === "bonus" && <BonusTab bonusPoints={bonusPoints} nextLevel={nextLevel} levelName={levelName} nextLevelName={nextLevelName} />}
        {tab === "profile" && <ProfileTab onTabChange={setTab} user={user} onLogout={onLogout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-white/60 z-40">
        <div className="flex items-center justify-around py-2 px-2">
          {([
            { key: "home", icon: "Home", label: "Главная" },
            { key: "catalog", icon: "Flower2", label: "Каталог" },
            { key: "orders", icon: "Package", label: "Заказы" },
            { key: "bonus", icon: "Star", label: "Бонусы" },
            { key: "profile", icon: "User", label: "Профиль" },
          ] as { key: Tab; icon: string; label: string }[]).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 ${
                tab === key
                  ? "bg-petal-100 text-petal-500 scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={icon} size={tab === key ? 22 : 20} />
              <span className="text-[10px] font-body font-medium">{label}</span>
              {key === "catalog" && cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-petal-400 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartItems.length}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HomeTab({ onTabChange, displayName, bonusPoints, phone }: { onTabChange: (t: Tab) => void; displayName: string; bonusPoints: number; phone?: string }) {
  return (
    <div className="px-5 pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-muted-foreground text-sm mb-1">Добро пожаловать,</p>
          <h1 className="font-display text-3xl font-light text-foreground">{displayName}</h1>
          {phone && <p className="font-body text-xs text-muted-foreground mt-0.5">{phone}</p>}
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-petal-200 to-bloom-200 flex items-center justify-center petal-shadow">
            <span className="text-xl">🌸</span>
          </div>
          <span className="absolute -top-1 -right-1 bg-petal-400 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-body font-bold">2</span>
        </div>
      </div>

      {/* Bonus card */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 petal-shadow-lg"
        style={{ background: "linear-gradient(135deg, #ffc2d4 0%, #f8d0ea 50%, #e4ede6 100%)" }}>
        <div className="absolute top-0 right-0 opacity-20 animate-petal-spin" style={{ fontSize: "8rem", lineHeight: 1 }}>🌸</div>
        <p className="font-body text-rose-700 text-sm mb-1">Серебряный уровень</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="font-display text-4xl font-semibold text-rose-800">{bonusPoints.toLocaleString()}</span>
          <span className="font-body text-rose-600 text-sm">бонусов</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-body text-rose-600">
            <span>До Золотого уровня</span>
            <span>760 бонусов</span>
          </div>
          <div className="h-2 bg-white/40 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-rose-400" style={{ width: "62%" }} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "Flower2", label: "Каталог цветов", tab: "catalog" as Tab, color: "from-petal-50 to-petal-100" },
            { icon: "Star", label: "Мои бонусы", tab: "bonus" as Tab, color: "from-bloom-50 to-bloom-100" },
            { icon: "Package", label: "История заказов", tab: "orders" as Tab, color: "from-sage-50 to-sage-100" },
            { icon: "Tag", label: "Акции", tab: "bonus" as Tab, color: "from-amber-50 to-orange-100" },
          ].map(({ icon, label, tab, color }) => (
            <button
              key={label}
              onClick={() => onTabChange(tab)}
              className={`bg-gradient-to-br ${color} rounded-[1.5rem] p-4 text-left flex flex-col gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] petal-shadow`}
            >
              <Icon name={icon} size={22} className="text-petal-400" />
              <span className="font-body text-sm font-medium text-foreground leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Push notification */}
      <div className="glass rounded-3xl p-4 flex gap-3 items-start petal-shadow">
        <div className="w-10 h-10 rounded-2xl bg-petal-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎂</span>
        </div>
        <div className="flex-1">
          <p className="font-body text-sm font-semibold text-foreground">Скоро день рождения!</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Через 12 дней — ваша скидка −20% уже ждёт вас</p>
        </div>
      </div>

      {/* Featured */}
      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Рекомендуем для вас</h2>
        <div className="rounded-[2rem] overflow-hidden petal-shadow-lg">
          <img src={FLOWER_IMG_1} alt="Пионовая нежность" className="w-full h-48 object-cover" />
          <div className="bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-medium text-foreground">Пионовая нежность</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">На основе ваших покупок</p>
              </div>
              <div className="text-right">
                <p className="font-body text-lg font-semibold text-petal-500">3 200 ₽</p>
                <p className="font-body text-xs text-muted-foreground line-through">3 800 ₽</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stores */}
      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Наши магазины</h2>
        <div className="space-y-3">
          {STORES.map(store => (
            <div key={store.name} className="glass rounded-3xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={16} className="text-petal-400 flex-shrink-0" />
                <p className="font-body text-sm font-semibold text-foreground">{store.name}</p>
              </div>
              <p className="font-body text-xs text-muted-foreground ml-6">{store.addr}</p>
              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-1">
                  <Icon name="Phone" size={12} className="text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">{store.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">{store.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function CatalogTab({ onAdd }: { onAdd: (id: number, name: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = CATALOG.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-5 pt-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-light text-foreground">Каталог</h1>
        <Badge className="bg-petal-100 text-petal-500 hover:bg-petal-100 font-body border-0">весна 2026</Badge>
      </div>

      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Найти цветы..."
          className="w-full glass rounded-2xl pl-10 pr-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-petal-300 transition-all"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className="bg-white rounded-[2rem] overflow-hidden petal-shadow animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
          >
            <div className="relative">
              <img src={item.img} alt={item.name} className="w-full h-52 object-cover" />
              <div className="absolute top-3 left-3">
                <Badge className={`font-body text-xs border-0 ${
                  item.tag === "Хит" ? "bg-petal-400 text-white hover:bg-petal-400" :
                  item.tag === "Новинка" ? "bg-sage-300 text-white hover:bg-sage-300" :
                  "bg-amber-400 text-white hover:bg-amber-400"
                }`}>{item.tag}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display text-xl font-medium text-foreground">{item.name}</h3>
              <p className="font-body text-xs text-muted-foreground mt-1 mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-body text-xl font-semibold text-foreground">{item.price.toLocaleString()} ₽</span>
                    {item.oldPrice && <span className="font-body text-sm text-muted-foreground line-through">{item.oldPrice.toLocaleString()} ₽</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-petal-400 text-xs">★</span>
                    <span className="font-body text-xs text-muted-foreground">+{item.bonus} бонусов</span>
                  </div>
                </div>
                <button
                  onClick={() => onAdd(item.id, item.name)}
                  className="bg-petal-400 hover:bg-petal-500 text-white rounded-2xl px-5 py-2.5 font-body text-sm font-medium transition-all hover:scale-105 active:scale-95 petal-shadow"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-4 space-y-3">
        <h3 className="font-display text-lg font-medium text-foreground">Доставка</h3>
        <div className="space-y-2">
          {[
            { icon: "Truck", text: "Доставка по городу от 300 ₽, бесплатно от 5 000 ₽" },
            { icon: "Clock", text: "Срочная доставка за 2 часа — +500 ₽" },
            { icon: "MapPin", text: "Самовывоз из любого магазина бесплатно" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <Icon name={icon} size={15} className="text-petal-400 flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="px-5 pt-8 space-y-5">
      <h1 className="font-display text-3xl font-light text-foreground">Мои заказы</h1>

      <div className="space-y-3">
        {ORDERS.map((order, i) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl p-4 petal-shadow animate-fade-in space-y-3"
            style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-xs text-muted-foreground">{order.date} · {order.id}</p>
                <h3 className="font-display text-lg font-medium text-foreground mt-0.5">{order.name}</h3>
              </div>
              <Badge className="bg-sage-100 text-sage-500 hover:bg-sage-100 font-body text-xs border-0">{order.status}</Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-body text-base font-semibold text-foreground">{order.price.toLocaleString()} ₽</span>
              <button className="flex items-center gap-1.5 text-petal-400 hover:text-petal-500 font-body text-sm font-medium transition-colors">
                <Icon name="Repeat2" size={15} />
                Повторить заказ
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5 text-center space-y-2">
        <span className="text-3xl">📦</span>
        <p className="font-display text-lg font-light text-foreground">Итого потрачено</p>
        <p className="font-body text-2xl font-semibold text-petal-400">
          {ORDERS.reduce((s, o) => s + o.price, 0).toLocaleString()} ₽
        </p>
        <p className="font-body text-xs text-muted-foreground">в {ORDERS.length} заказах</p>
      </div>

      <div className="h-4" />
    </div>
  );
}

function BonusTab({ bonusPoints, nextLevel, levelName, nextLevelName }: {
  bonusPoints: number; nextLevel: number; levelName: string; nextLevelName: string;
}) {
  const percent = Math.round((bonusPoints / nextLevel) * 100);

  return (
    <div className="px-5 pt-8 space-y-5">
      <h1 className="font-display text-3xl font-light text-foreground">Бонусы</h1>

      <div
        className="rounded-[2rem] p-6 petal-shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ffc2d4 0%, #f8d0ea 60%, #c8dccb 100%)" }}
      >
        <div className="absolute -right-6 -top-6 text-8xl opacity-20 animate-float" style={{ lineHeight: 1 }}>🌹</div>
        <p className="font-body text-rose-700 text-sm font-medium mb-1">{levelName} уровень</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-display text-5xl font-semibold text-rose-800">{bonusPoints.toLocaleString()}</span>
          <span className="font-body text-rose-600">бонусов</span>
        </div>
        <p className="font-body text-xs text-rose-600 mb-2">До уровня «{nextLevelName}»: {(nextLevel - bonusPoints).toLocaleString()} бонусов</p>
        <div className="h-2.5 bg-white/40 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-petal-400" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Как использовать бонусы</h2>
        <div className="space-y-2">
          {[
            { icon: "Flower2", title: "Оплата заказа", desc: "До 30% от суммы заказа бонусами", color: "bg-petal-50" },
            { icon: "Gift", title: "Обмен на подарок", desc: "500 бонусов = красивая упаковка в подарок", color: "bg-bloom-50" },
            { icon: "Truck", title: "Бесплатная доставка", desc: "200 бонусов = бесплатная доставка", color: "bg-sage-50" },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`${color} rounded-3xl p-4 flex gap-3 items-center`}>
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 petal-shadow">
                <Icon name={icon} size={18} className="text-petal-400" />
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-foreground">{title}</p>
                <p className="font-body text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Уровни лояльности</h2>
        <div className="space-y-2">
          {[
            { name: "Бронзовый", range: "0 – 999", icon: "🥉", active: false },
            { name: "Серебряный", range: "1 000 – 1 999", icon: "🥈", active: true },
            { name: "Золотой", range: "2 000 – 4 999", icon: "🥇", active: false },
            { name: "Платиновый", range: "5 000+", icon: "💎", active: false },
          ].map(({ name, range, icon, active }) => (
            <div key={name} className={`rounded-3xl px-4 py-3 flex items-center gap-3 transition-all ${active ? "bg-gradient-to-r from-petal-100 to-bloom-100 petal-shadow" : "bg-white/60"}`}>
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <p className={`font-body text-sm font-semibold ${active ? "text-petal-500" : "text-foreground"}`}>{name}</p>
                <p className="font-body text-xs text-muted-foreground">{range} бонусов</p>
              </div>
              {active && <Badge className="bg-petal-400 text-white hover:bg-petal-400 font-body text-xs border-0">Ваш уровень</Badge>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Специальные предложения</h2>
        <div className="space-y-3">
          {OFFERS.map(({ icon, title, desc, color, accent }) => (
            <div key={title} className={`bg-gradient-to-r ${color} rounded-3xl p-4 flex gap-3 items-start`}>
              <div className="w-10 h-10 bg-white/70 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon name={icon} size={18} className={accent} />
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-foreground">{title}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function ProfileTab({ onTabChange, user, onLogout }: { onTabChange: (t: Tab) => void; user?: AppUser; onLogout?: () => void }) {
  const displayName = user?.name || user?.phone || "Гость";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="px-5 pt-8 space-y-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-petal-200 to-bloom-300 flex items-center justify-center petal-shadow-lg">
          <span className="font-display text-4xl text-white font-light">{initial}</span>
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-medium text-foreground">{displayName}</h1>
          {user?.phone && <p className="font-body text-sm text-muted-foreground mt-0.5">{user.phone}</p>}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Badge className="bg-gradient-to-r from-petal-300 to-bloom-300 text-white hover:from-petal-300 font-body border-0">Серебряный уровень</Badge>
          <Badge className="bg-sage-100 text-sage-500 hover:bg-sage-100 font-body border-0">{user?.bonus_points ?? 0} бонусов</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Заказов", value: "3" },
          { label: "Бонусов", value: (user?.bonus_points ?? 0).toLocaleString() },
          { label: "Потрачено", value: "7 900 ₽" },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-3xl p-3 text-center">
            <p className="font-body text-base font-semibold text-foreground">{value}</p>
            <p className="font-body text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Важные даты</h2>
        <div className="space-y-2">
          {[
            { icon: "🎂", label: "День рождения", value: "5 мая" },
            { icon: "💝", label: "Годовщина", value: "14 февраля" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white rounded-3xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <p className="font-body text-sm text-foreground flex-1">{label}</p>
              <p className="font-body text-sm text-muted-foreground">{value}</p>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          ))}
          <button className="w-full bg-petal-50 hover:bg-petal-100 rounded-3xl px-4 py-3 flex items-center gap-3 transition-colors">
            <Icon name="Plus" size={18} className="text-petal-400" />
            <p className="font-body text-sm text-petal-500 font-medium">Добавить дату</p>
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-3">Любимые цветы</h2>
        <div className="glass rounded-3xl p-4 space-y-3">
          <p className="font-body text-xs text-muted-foreground">Мы подбираем рекомендации на основе ваших предпочтений</p>
          <div className="flex flex-wrap gap-2">
            {["Пионы", "Тюльпаны", "Орхидеи", "Розы"].map(f => (
              <span key={f} className="bg-petal-100 text-petal-500 text-xs font-body font-medium px-3 py-1.5 rounded-full">{f}</span>
            ))}
            <button className="bg-white border border-petal-200 text-petal-400 text-xs font-body px-3 py-1.5 rounded-full hover:bg-petal-50 transition-colors">+ добавить</button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {([
          { icon: "Bell", label: "Push-уведомления", sub: "Акции и поздравления включены" },
          { icon: "Package", label: "История заказов", action: () => onTabChange("orders") },
          { icon: "MapPin", label: "Адреса доставки" },
          { icon: "HelpCircle", label: "Поддержка" },
          { icon: "LogOut", label: "Выйти", danger: true, action: onLogout },
        ] as { icon: string; label: string; sub?: string; danger?: boolean; action?: () => void }[]).map(({ icon, label, sub, danger, action }) => (
          <button
            key={label}
            onClick={action}
            className={`w-full bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-muted/30 ${danger ? "text-rose-400" : "text-foreground"}`}
          >
            <Icon name={icon} size={18} className={danger ? "text-rose-400" : "text-muted-foreground"} />
            <div className="flex-1 text-left">
              <p className="font-body text-sm">{label}</p>
              {sub && <p className="font-body text-xs text-muted-foreground">{sub}</p>}
            </div>
            {!danger && <Icon name="ChevronRight" size={16} className="text-muted-foreground" />}
          </button>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}