import React from "react";
const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  message:
    "M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z M7 10h10 M7 14h7",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  up: "M6 18 18 6 M6 6h12v12",
  chevron: "m9 5 7 7-7 7",
  sun: "M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 1.5 1.5 M5 19l1.5-1.5 M17.5 6.5 1.5-1.5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  code: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  book: "M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3Z M12 6v16",
  chip: "M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4",
  lock: "M6 10h12v11H6Z M8 10V6a4 4 0 0 1 8 0v4",
  close: "m6 6 12 12 M18 6 6 18",
  search: "M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  wave: "M2 9c4-8 6 8 10 0s6 8 10 0 M2 17c4-8 6 8 10 0s6 8 10 0",
  game: "M7 6h10c4 0 7 14 3 14l-5-4H9l-5 4C0 20 3 6 7 6Z M6 9v6 M3 12h6 M16 11h.01 M19 14h.01",
};
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.code} />
    </svg>
  );
}
