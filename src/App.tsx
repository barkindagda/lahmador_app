import { useState, useRef } from "react";

/* ─── DESIGN TOKENS ──────────────────────────────────── */
const C = {
  // Brand Wood Colors (Neutralized, elegant wood tones)
  wood:        "#452E1E", // Deep walnut brown
  woodMid:     "#7A573F", // Neutral oak mid-tone
  woodLight:   "#A87E5D", // Golden wood highlight (Used for Logo outline)
  woodPale:    "#C7A386", // Soft wood tone
  woodFaint:   "#F5EFEB", // Very light tint
  woodBorder:  "#E1D6CD", // Soft divider

  
  // Base App Colors
  bg:          "#FCFAF8", 
  surface:     "#FFFFFF",
  border:      "#E2E3E5", 
  
  // Supporting Status Colors
  clay:        "#A24530", 
  clayFaint:   "#F8EFEA",
  gold:        "#B58E38",
  goldFaint:   "#F8F5EE",
  sage:        "#427653",
  sageFaint:   "#EDF3EE",
  
  // Overlays & Text on Wood
  onDark:      "#FFFFFF", 
  onDarkSub:   "rgba(255,255,255,0.75)", 
  onDarkMuted: "rgba(255,255,255,0.40)",
  
  // Standard Typography
  text0:       "#2B1D16", 
  text1:       "#4C372D", 
  text2:       "#8E7769", 
};

const F = {
  display: "'Playfair Display', serif",
  body:    "'Inter', sans-serif",
};

/* ─── TYPES ──────────────────────────────────────────── */
type Tab = "landing" | "home" | "loyalty" | "profile";
type Section = "rewards" | "challenges";
type GenPhase = "idle" | "loading" | "done";

interface Reward {
  id: number;
  pts: number;
  name: string;
  sub: string;
}

interface Challenge {
  id: number;
  title: string;
  sub: string;
  pts: number;
  progress: number;
  total: number;
  claimed?: boolean;
}

interface HistoryItem {
  date: string;
  item: string;
  pts: number;
}

type ModalState =
  | { type: "redeem"; r: Reward }
  | { type: "challenge"; ch: Challenge }
  | null;

/* ─── MOCK DATA ──────────────────────────────────────── */
const REWARDS: Reward[] = [
  { id: 1, pts: 50,  name: "Ayran",         sub: "Soğuk yoğurt içeceği"          },
  { id: 2, pts: 120, name: "Lahmacun",       sub: "Klasik kıymalı ince hamur"     },
  { id: 3, pts: 180, name: "Kıymalı Pide",   sub: "Taze pişmiş dana kıymalı pide" },
  { id: 4, pts: 350, name: "İkili Ziyafet",  sub: "Meze tabağı ve iki ana yemek"  },
];

const INIT_CHALLENGES: Challenge[] = [
  { id: 1, title: "İki Kez Lahmacun",  sub: "Bu hafta iki ayrı ziyarette lahmacun söyle", pts: 30, progress: 1, total: 2 },
  { id: 2, title: "Arkadaşını Getir",  sub: "Lahmador'a ilk kez gelen biriyle ye",        pts: 50, progress: 0, total: 1 },
  { id: 3, title: "Hafta Sonu Masası", sub: "Cumartesi veya Pazar günü gel",              pts: 20, progress: 0, total: 1 },
];

const ALT_CHALLENGES: Challenge[] = [
  { id: 4, title: "Baharat Keşfi",    sub: "Şefin özel baharatlı karışımını dene", pts: 40, progress: 0, total: 1 },
  { id: 5, title: "3 Günlük Seri",    sub: "Üst üste üç gün ziyaret et",          pts: 75, progress: 1, total: 3 },
  { id: 6, title: "Yemeğini Paylaş",  sub: "Siparişinin fotoğrafını paylaş",      pts: 35, progress: 0, total: 1 },
];

const HISTORY: HistoryItem[] = [
  { date: "Bugün", item: "Lahmacun — Masa 4", pts: +24 },
  { date: "Pzt",   item: "Pide & Ayran",      pts: +18 },
  { date: "Cum",   item: "Aile Yemeği",       pts: +60 },
  { date: "Per",   item: "Ayran Kullanıldı",  pts: -50 },
];

/* ─── ROOT ───────────────────────────────────────────── */
export default function App() {
  const [tab,        setTab]        = useState<Tab>("landing");
  const [pts,        setPts]        = useState<number>(240);
  const [modal,      setModal]      = useState<ModalState>(null);
  const [challenges, setChallenges] = useState<Challenge[]>(INIT_CHALLENGES);
  const [genPhase,   setGenPhase]   = useState<GenPhase>("idle");

  const generateChallenges = () => {
    if (genPhase === "loading") return;
    setGenPhase("loading");
    setTimeout(() => { setChallenges(ALT_CHALLENGES); setGenPhase("done"); }, 2200);
  };

  const claimChallenge = (ch: Challenge) => {
    setPts(p => p + ch.pts);
    setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, claimed: true } : c));
    setModal({ type: "challenge", ch });
  };

  const redeemReward = (r: Reward) => {
    if (pts < r.pts) return;
    setPts(p => p - r.pts);
    setModal({ type: "redeem", r });
  };

  const isLanding = tab === "landing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
        html, body { background:${C.wood}; }
        button { cursor:pointer; border:none; background:none; font-family:${F.body}; color:inherit; }
        input[type=file] { display:none; }
        ::-webkit-scrollbar { display:none; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }

        .fu  { animation: fadeUp 0.48s cubic-bezier(.16,1,.3,1) both; }
        .fi  { animation: fadeIn 0.35s ease both; }
        .press { transition: transform 0.12s, opacity 0.12s; }
        .press:active { transform:scale(0.97); opacity:0.82; }
        .shimmer-light {
          background: linear-gradient(90deg, #F0EBE4 25%, #E8E0D5 50%, #F0EBE4 75%);
          background-size:600px 100%;
          animation: shimmer 1.5s infinite;
          border-radius:14px;
        }
      `}</style>

      <div style={{
        fontFamily:    F.body,
        background:    isLanding ? C.wood : C.bg,
        color:         isLanding ? C.onDark : C.text0,
        minHeight:     "100vh",
        maxWidth:      430,
        margin:        "0 auto",
        position:      "relative",
        paddingBottom: isLanding ? 0 : 72,
        transition:    "background 0.4s",
      }}>
        {tab === "landing" && <Landing   setTab={setTab} />}
        {tab === "home"    && <Home      pts={pts} setTab={setTab} />}
        {tab === "loyalty" && <Loyalty   pts={pts} rewards={REWARDS} challenges={challenges} genPhase={genPhase} onGenerate={generateChallenges} onClaim={claimChallenge} onRedeem={redeemReward} setTab={setTab} />}
        {tab === "profile" && <Profile   pts={pts} history={HISTORY} setTab={setTab} />}

        {!isLanding && <BottomNav tab={tab} setTab={setTab} />}
        {modal      && <Modal modal={modal} onClose={() => setModal(null)} />}
      </div>
    </>
  );
}

/* ─── SHARED COMPONENTS ──────────────────────────────── */
function LogoCircle({ size, fontSize, letterSpacing = "2px" }: { size: number, fontSize: number, letterSpacing?: string }) {
  // SVG Math to calculate the perfect cuts
  const r = 46; 
  const circ = 2 * Math.PI * r;
  // Make the gap span 24% of the circumference to frame the L and R perfectly
  const gap = circ * 0.08; 
  const dash = (circ - 2 * gap) / 2;
  // Offset centers the gaps exactly at 9 o'clock and 3 o'clock
  const offset = dash + gap / 2;

  return (
    <div style={{
      width: size,
      height: size,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        style={{ position: "absolute", inset: 0 }}
      >
        <circle 
          cx="50" 
          cy="50" 
          r={r} 
          fill="none" 
          stroke={C.bg} 
          strokeWidth="3" // Increased thickness for a much more definite circle
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={offset}
          strokeLinecap="round" // Gives the cut edges an elegant rounded finish
        />
      </svg>
      <div style={{
        fontFamily: F.display,
        fontSize: fontSize,
        fontWeight: 800,
        color: C.onDark,
        letterSpacing: letterSpacing,
        textAlign: "center",
        whiteSpace: "nowrap",
        position: "relative",
        zIndex: 1,
      }}>
        LAHMADOR
      </div>
    </div>
  );
}
function TopBar({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, position: "relative", zIndex: 1 }}>
      <LogoCircle size={64} fontSize={10} letterSpacing="1px" />
      <button className="press" onClick={() => setTab("landing")} style={{ display: "flex", alignItems: "center", gap: 6, color: C.onDarkSub, fontSize: 12, fontWeight: 600 }}>
        <span>Çıkış Yap</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}

/* ─── LANDING ────────────────────────────────────────── */
function Landing({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Wood grain background - Lightened base and reduced dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%),
          repeating-linear-gradient(88deg, transparent 0px, transparent 18px, rgba(255,255,255,0.025) 18px, rgba(255,255,255,0.025) 19px),
          repeating-linear-gradient(92deg, transparent 0px, transparent 40px, rgba(0,0,0,0.04) 40px, rgba(0,0,0,0.04) 41px)
        `,
        backgroundColor: C.woodMid,
      }} />

      {/* Warm vignette from bottom - Softened */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
        background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(168,126,93,0.35) 0%, transparent 70%)", 
        pointerEvents: "none",
      }} />

      {/* Centred Logo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <div className="fu" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.15))" }}>
          <LogoCircle size={200} fontSize={30} letterSpacing="4px" />
        </div>
      </div>

      {/* CTA */}
      <div className="fu" style={{ animationDelay: "0.2s", padding: "0 32px 56px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="press" onClick={() => setTab("home")} style={{
          width: "100%", padding: "16px 24px",
          background: C.onDark, color: C.wood, 
          borderRadius: 14, fontWeight: 700, fontSize: 16, letterSpacing: "0.1px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          Giriş Yap
        </button>
        <button className="press" onClick={() => setTab("home")} style={{
          width: "100%", padding: "16px 24px",
          background: "rgba(0,0,0,0.15)", 
          color: C.onDark,
          border: `1.5px solid rgba(255,255,255,0.8)`,
          borderRadius: 14, fontWeight: 700, fontSize: 16, letterSpacing: "0.1px",
        }}>
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}

/* ─── HOME ───────────────────────────────────────────── */
function Home({ pts, setTab }: { pts: number; setTab: (t: Tab) => void }) {
  const nextReward = REWARDS.find(r => r.pts > pts) ?? REWARDS[REWARDS.length - 1];
  const pct = Math.min(100, Math.round((pts / nextReward.pts) * 100));

  return (
    <div>
      {/* Wood header */}
      <div style={{
        background: `linear-gradient(160deg, ${C.wood} 0%, ${C.woodMid} 60%, ${C.woodLight} 100%)`,
        padding: "32px 24px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(88deg, transparent 0, transparent 22px, #fff 22px, #fff 23px)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(92deg, transparent 0, transparent 45px, #000 45px, #000 46px)" }} />

        <TopBar setTab={setTab} />

        <div className="fu" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: C.onDarkSub, marginBottom: 6, fontWeight: 400 }}>Tekrar hoş geldin</div>
          <div style={{ fontFamily: F.display, fontSize: 30, fontWeight: 700, color: C.onDark, lineHeight: 1.1, marginBottom: 2 }}>Ahmet Yildiz</div>
          <div style={{ fontSize: 13, color: C.onDarkSub }}>Altın Üye · Girne</div>
        </div>

        {/* Points pill */}
        <div className="fu" style={{ animationDelay: "0.08s", position: "relative", zIndex: 1, marginTop: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "16px 20px", backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: 11, color: C.onDarkSub, letterSpacing: "1.5px", marginBottom: 6 }}>LAHMADOR PUANLARI</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
              <span style={{ fontFamily: F.display, fontSize: 44, fontWeight: 700, color: C.onDark, lineHeight: 1 }}>{pts}</span>
              <span style={{ fontSize: 13, color: C.onDarkSub }}>puan</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #D4A843, #F0C96A)", borderRadius: 2, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: C.onDarkSub }}>{nextReward.pts - pts} puan daha gerekiyor</span>
              <span style={{ fontSize: 12, color: "#F0C96A", fontWeight: 500 }}>{nextReward.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px 0" }}>

        {/* Today's special */}
        <div className="fu" style={{ animationDelay: "0.1s", marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text0, marginBottom: 14 }}>Bugün Lahmador'da</div>
          <div style={{ background: C.wood, borderRadius: 18, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(88deg, transparent 0, transparent 18px, #fff 18px, #fff 19px)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, color: C.onDarkSub, letterSpacing: "1.5px", marginBottom: 8 }}>ÇİFT PUAN GÜNÜ</div>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.onDark, marginBottom: 6 }}>Lahmacun Özel</div>
              <div style={{ fontSize: 14, color: C.onDarkSub, lineHeight: 1.55 }}>Bugün tüm lahmacun siparişlerinde 2× Lahmador Puanı kazan.</div>
            </div>
          </div>
        </div>

        {/* Quick access */}
        <div className="fu" style={{ animationDelay: "0.14s", marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text0, marginBottom: 14 }}>Hızlı Erişim</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { label: "Lahmador Puanları", sub: "Ödüller ve görevler", tab: "loyalty" as Tab },
              { label: "Hesabım",           sub: "Geçmiş ve profil",    tab: "profile" as Tab },
            ]).map(a => (
              <button key={a.tab} className="press" onClick={() => setTab(a.tab)} style={{
                background: C.surface, border: `1.5px solid ${C.border}`,
                borderRadius: 16, padding: "18px 16px", textAlign: "left",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text0, lineHeight: 1.3, marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: C.text2 }}>{a.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="fu" style={{ animationDelay: "0.18s", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text0, marginBottom: 14 }}>Son İşlemler</div>
          <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            {HISTORY.map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < HISTORY.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.pts > 0 ? C.sage : C.text2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text0 }}>{h.item}</div>
                    <div style={{ fontSize: 12, color: C.text2, marginTop: 1 }}>{h.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: h.pts > 0 ? C.sage : C.text2 }}>
                  {h.pts > 0 ? "+" : ""}{h.pts} puan
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LOYALTY ────────────────────────────────────────── */
interface LoyaltyProps {
  pts: number;
  rewards: Reward[];
  challenges: Challenge[];
  genPhase: GenPhase;
  onGenerate: () => void;
  onClaim: (ch: Challenge) => void;
  onRedeem: (r: Reward) => void;
  setTab: (t: Tab) => void;
}

function Loyalty({ pts, rewards, challenges, genPhase, onGenerate, onClaim, onRedeem, setTab }: LoyaltyProps) {
  const [section, setSection] = useState<Section>("rewards");

  return (
    <div>
      {/* Wood header */}
      <div style={{ background: `linear-gradient(160deg, ${C.wood} 0%, ${C.woodMid} 100%)`, padding: "32px 24px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(88deg, transparent 0, transparent 22px, #fff 22px, #fff 23px)" }} />

        <TopBar setTab={setTab} />

        <div className="fu" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: C.onDarkSub, letterSpacing: "2px", marginBottom: 8 }}>LAHMADOR PUANLARI</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: F.display, fontSize: 50, fontWeight: 700, color: C.onDark, lineHeight: 1 }}>{pts}</span>
            <span style={{ fontSize: 14, color: C.onDarkSub }}>puan</span>
          </div>
          <div style={{ fontSize: 13, color: C.onDarkSub, marginBottom: 24 }}>Ahmet Yildiz · Altın Üye</div>
        </div>

        {/* Segment control */}
        <div style={{ position: "relative", zIndex: 1, display: "flex" }}>
          {([ { key: "rewards" as Section, label: "Ödüller" }, { key: "challenges" as Section, label: "Görevler" } ]).map(s => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{
              flex: 1, padding: "13px",
              fontWeight: section === s.key ? 600 : 400,
              fontSize: 14,
              color: section === s.key ? C.onDark : C.onDarkSub,
              borderBottom: section === s.key ? "2.5px solid rgba(255,255,255,0.9)" : "2.5px solid rgba(255,255,255,0.12)",
              transition: "all 0.2s",
              background: "none",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: "24px 20px 0" }} key={section}>

        {/* ── REWARDS ── */}
        {section === "rewards" && (
          <>
            <div className="fu" style={{ fontSize: 13, color: C.text2, marginBottom: 18, lineHeight: 1.5 }}>
              Lahmador Puanlarınızı bir sonraki ziyaretinizde ücretsiz ürünlere dönüştürün.
            </div>
            {rewards.map((r, i) => {
              const can = pts >= r.pts;
              const pct = Math.min(100, Math.round((pts / r.pts) * 100));
              return (
                <div key={r.id} className="fu" style={{ animationDelay: `${i * 0.06}s`, marginBottom: 12 }}>
                  <div style={{
                    background: C.surface,
                    border: `1.5px solid ${can ? "#D5C4B4" : C.border}`,
                    borderRadius: 16, padding: "18px",
                    boxShadow: can ? "0 2px 20px rgba(61,32,16,0.1)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: can ? 14 : 12 }}>
                      <div>
                        <div style={{ fontFamily: F.display, fontSize: 19, fontWeight: 600, color: C.text0, marginBottom: 3 }}>{r.name}</div>
                        <div style={{ fontSize: 13, color: C.text2 }}>{r.sub}</div>
                      </div>
                      <div style={{ background: can ? C.wood : C.bg, borderRadius: 10, padding: "6px 12px", textAlign: "center", flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: can ? C.onDark : C.text2 }}>{r.pts}</div>
                        <div style={{ fontSize: 10, color: can ? C.onDarkSub : C.text2, letterSpacing: "0.5px" }}>puan</div>
                      </div>
                    </div>
                    {!can && (
                      <div style={{ marginBottom: 2 }}>
                        <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.woodPale}, ${C.woodMid})`, borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 12, color: C.text2 }}>{r.pts - pts} puan daha gerekiyor</div>
                      </div>
                    )}
                    {can && (
                      <button className="press" onClick={() => onRedeem(r)} style={{
                        width: "100%", padding: "12px",
                        background: C.wood, color: C.onDark,
                        borderRadius: 10, fontWeight: 600, fontSize: 14,
                      }}>Kullan</button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── CHALLENGES ── */}
        {section === "challenges" && (
          <>
            <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: C.text2, flex: 1, paddingRight: 12, lineHeight: 1.5 }}>
                Görevleri tamamlayarak ekstra Lahmador Puanı kazan.
              </div>
              <button className="press" onClick={onGenerate} disabled={genPhase === "loading"} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 14px", flexShrink: 0,
                background: C.woodFaint, border: `1.5px solid ${C.woodBorder}`,
                borderRadius: 10, fontSize: 13, fontWeight: 500,
                color: genPhase === "loading" ? C.text2 : C.woodMid,
              }}>
                {genPhase === "loading" ? <><Spinner color={C.text2} /> Yükleniyor</> : "Yenile"}
              </button>
            </div>

            {genPhase === "loading"
              ? [1, 2, 3].map(i => <div key={i} className="shimmer-light" style={{ height: 110, marginBottom: 12 }} />)
              : challenges.map((ch, i) => {
                const done = ch.progress >= ch.total;
                const pct  = Math.min(100, Math.round((ch.progress / ch.total) * 100));
                return (
                  <div key={ch.id} className="fu" style={{ animationDelay: `${i * 0.07}s`, marginBottom: 12 }}>
                    <div style={{
                      background: C.surface,
                      border: `1.5px solid ${done && !ch.claimed ? "#C2D9CB" : C.border}`,
                      borderRadius: 16, padding: "18px",
                      opacity: ch.claimed ? 0.5 : 1,
                      boxShadow: done && !ch.claimed ? "0 2px 16px rgba(58,125,84,0.1)" : "none",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: C.text0 }}>{ch.title}</div>
                            {done && !ch.claimed && (
                              <div style={{ fontSize: 11, fontWeight: 600, color: C.sage, background: C.sageFaint, padding: "2px 8px", borderRadius: 20 }}>Hazır</div>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.45 }}>{ch.sub}</div>
                        </div>
                        <div style={{ background: C.woodFaint, borderRadius: 10, padding: "6px 12px", textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.woodMid }}>+{ch.pts}</div>
                          <div style={{ fontSize: 10, color: C.text2, letterSpacing: "0.5px" }}>puan</div>
                        </div>
                      </div>
                      <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: done ? `linear-gradient(90deg, #5CA86A, ${C.sage})` : `linear-gradient(90deg, ${C.woodPale}, ${C.woodMid})`,
                          borderRadius: 2, transition: "width 0.9s cubic-bezier(.16,1,.3,1)",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: C.text2 }}>{ch.progress} / {ch.total} tamamlandı</span>
                        {done && !ch.claimed && (
                          <button className="press" onClick={() => onClaim(ch)} style={{
                            padding: "7px 16px",
                            background: C.wood, color: C.onDark,
                            borderRadius: 8, fontSize: 13, fontWeight: 600,
                          }}>Al</button>
                        )}
                        {ch.claimed && <span style={{ fontSize: 13, fontWeight: 600, color: C.sage }}>Alındı</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </>
        )}
      </div>
    </div>
  );
}

/* ─── PROFILE ────────────────────────────────────────── */
function Profile({ pts, history, setTab }: { pts: number; history: HistoryItem[]; setTab: (t: Tab) => void }) {
  const earned = history.filter(h => h.pts > 0).reduce((a, h) => a + h.pts, 0);
  return (
    <div>
      {/* Wood header */}
      <div style={{ background: `linear-gradient(160deg, ${C.wood} 0%, ${C.woodMid} 100%)`, padding: "32px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(88deg, transparent 0, transparent 22px, #fff 22px, #fff 23px)" }} />
        
        <TopBar setTab={setTab} />

        <div className="fu" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.display, fontSize: 20, color: C.onDark, fontWeight: 600, flexShrink: 0,
          }}>AY</div>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.onDark, marginBottom: 3 }}>Ahmet Yildiz</div>
            <div style={{ fontSize: 13, color: C.onDarkSub, marginBottom: 8 }}>Ocak 2024'ten beri üye</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F0C96A" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#F0C96A", letterSpacing: "0.5px" }}>ALTIN ÜYE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & history */}
      <div style={{ padding: "24px 20px 0" }}>
        <div className="fu" style={{ animationDelay: "0.06s", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {([
            { label: "Bakiye",    value: pts    },
            { label: "Ziyaret",   value: 24     },
            { label: "Kazanılan", value: earned },
          ]).map(s => (
            <div key={s.label} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "16px 12px" }}>
              <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text0, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.text2, letterSpacing: "0.3px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="fu" style={{ animationDelay: "0.1s" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text0, marginBottom: 14 }}>İşlem Geçmişi</div>
          <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            {history.map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px",
                borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.pts > 0 ? C.sage : C.text2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text0 }}>{h.item}</div>
                    <div style={{ fontSize: 12, color: C.text2, marginTop: 1 }}>{h.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: h.pts > 0 ? C.sage : C.text2 }}>
                  {h.pts > 0 ? "+" : ""}{h.pts} puan
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────── */
const NAV: { id: Tab; label: string; d: string }[] = [
  { id: "home",    label: "Ana Sayfa", d: "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z M9 21V12h6v9" },
  { id: "loyalty", label: "Puanlarım", d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id: "profile", label: "Hesabım",   d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
];

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 0,
      left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom,0px)",
      boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 -8px 24px rgba(0,0,0,0.06)",
    }}>
      {NAV.map(n => {
        const active = tab === n.id;
        return (
          <button key={n.id} className="press" onClick={() => setTab(n.id)} style={{
            flex: 1, paddingTop: 12, paddingBottom: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
            position: "relative",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={active ? C.wood : C.text2}
              strokeWidth={active ? "2" : "1.5"}
              strokeLinecap="round" strokeLinejoin="round">
              {n.d.split(" M").map((p, i) => (
                <path key={i} d={i === 0 ? p : "M" + p} />
              ))}
            </svg>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? C.wood : C.text2, letterSpacing: "0.2px" }}>
              {n.label}
            </span>
            {active && <div style={{ position: "absolute", top: 0, width: 24, height: 2, background: C.wood, borderRadius: "0 0 2px 2px" }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────── */
function Modal({ modal, onClose }: { modal: NonNullable<ModalState>; onClose: () => void }) {
  const CODE = useRef<string>(`LHD-${Math.floor(1000 + Math.random() * 9000)}`).current;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(20,10,4,0.6)",
      zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface,
        borderRadius: "24px 24px 0 0",
        padding: "12px 24px 44px",
        width: "100%", maxWidth: 430,
        animation: "slideUp 0.32s cubic-bezier(.16,1,.3,1) both",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 28px" }} />

        {modal.type === "redeem" && (
          <>
            <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text0, marginBottom: 4 }}>Kullanıldı!</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 24, lineHeight: 1.5 }}>
              {modal.r.name} — {modal.r.sub}. Aşağıdaki kodu garsona gösterin.
            </div>
            <div style={{ background: C.woodFaint, border: `1.5px dashed ${C.woodBorder}`, borderRadius: 14, padding: "20px 24px", marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.text2, letterSpacing: "2px", marginBottom: 10 }}>KODUNUZ</div>
              <div style={{ fontFamily: F.display, fontSize: 36, fontWeight: 700, color: C.wood, letterSpacing: "5px" }}>{CODE}</div>
            </div>
            <button className="press" onClick={onClose} style={{ width: "100%", padding: "14px", background: C.wood, color: C.onDark, borderRadius: 12, fontWeight: 600, fontSize: 15 }}>
              Tamam
            </button>
          </>
        )}

        {modal.type === "challenge" && (
          <>
            <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text0, marginBottom: 4 }}>Görev tamamlandı!</div>
            <div style={{ fontSize: 14, color: C.text2, marginBottom: 24, lineHeight: 1.5 }}>
              <strong style={{ color: C.sage }}>+{modal.ch.pts} Lahmador Puanı</strong> bakiyenize eklendi.
            </div>
            <button className="press" onClick={onClose} style={{ width: "100%", padding: "14px", background: C.sage, color: C.onDark, borderRadius: 12, fontWeight: 600, fontSize: 15 }}>
              Devam Et
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SPINNER ────────────────────────────────────────── */
function Spinner({ color }: { color: string }) {
  return (
    <div style={{
      width: 12, height: 12, flexShrink: 0,
      border: "2px solid rgba(0,0,0,0.08)",
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}