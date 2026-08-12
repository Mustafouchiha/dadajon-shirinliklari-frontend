// ─── DESIGN TOKENS (Dadajon Tort — cocoa/berry) ────────────────────
// bg: #FBF6EF (warm ivory)  surface: #FFFFFF
// cocoa (primary/text): #4A2E22   berry (accent/CTA): #A93446
// rose (soft accent): #E7AFB0     taupe (secondary text): #9C8778
export const C = {
  bg:           "#FBF6EF",
  card:         "#FFFFFF",
  cocoa:        "#4A2E22",
  cocoaSoft:    "#F3E7DC",
  berry:        "#A93446",
  rose:         "#E7AFB0",
  taupe:        "#9C8778",
  taupeLight:   "#B9A793",
  border:       "#F0E4D6",
  danger:       "#EF4444",
};

export const APP_NAME = "Dadajon Tort";

export const CATEGORIES = [
  "Tortlar",
  "Kapkeyk",
  "Piroglar",
  "Shirinliklar",
  "Maxsus",
];

export const ORDER_STATUS = {
  new:        { label: "Yangi",         bg: "#F3E7DC", color: "#4A2E22" },
  ready:      { label: "Tayyor",        bg: "#FFF3E0", color: "#B7791F" },
  picked_up:  { label: "Berildi",       bg: "#E8F8F0", color: "#28A869" },
  cancelled:  { label: "Bekor qilingan", bg: "#FFF1F0", color: "#EF4444" },
};

// Do'kon ma'lumotlari — buyurtma faqat shu manzildan olib ketiladi (dastavka yo'q)
export const SHOP_INFO = {
  name: "Dadajon Tort",
  address: "Asaka, Andijon",
  hours: "Har kuni 09:00 – 20:00",
};

export const fmt = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
