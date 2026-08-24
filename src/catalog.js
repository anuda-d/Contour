export const mediaCatalogue = Object.freeze([
  Object.freeze({
    id: "left-hand",
    format: "book",
    title: "The Left Hand of Darkness",
    creator: "Ursula K. Le Guin",
    year: 1969,
  }),
  Object.freeze({
    id: "dispossessed",
    format: "book",
    title: "The Dispossessed",
    creator: "Ursula K. Le Guin",
    year: 1974,
  }),
  Object.freeze({
    id: "bluets",
    format: "book",
    title: "Bluets",
    creator: "Maggie Nelson",
    year: 2009,
  }),
  Object.freeze({
    id: "arrival",
    format: "film",
    title: "Arrival",
    creator: "Denis Villeneuve",
    year: 2016,
  }),
  Object.freeze({
    id: "mood-for-love",
    format: "film",
    title: "In the Mood for Love",
    creator: "Wong Kar-wai",
    year: 2000,
  }),
  Object.freeze({
    id: "aftersun",
    format: "film",
    title: "Aftersun",
    creator: "Charlotte Wells",
    year: 2022,
  }),
]);

export function getCatalogue() {
  return mediaCatalogue.map((item) => ({ ...item }));
}
