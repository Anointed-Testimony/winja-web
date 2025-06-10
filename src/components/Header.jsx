import { FaBell } from "react-icons/fa";
import theme from "../theme";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-8 py-4 rounded-2xl shadow-xl backdrop-blur-lg sticky top-6 left-0 right-0 z-40 mx-6 mt-6"
      style={{ background: theme.surfaceGlass }}
    >
      <div className="flex items-center gap-4 flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-xs px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-gray-700 shadow"
          style={{
            background: theme.accent,
            borderColor: theme.border,
            color: theme.text,
          }}
        />
      </div>
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-2"
          style={{ color: theme.textLight }}
        >
          <span className="font-semibold text-sm">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <button
          className="relative transition"
          style={{ color: theme.textLight, background: theme.surface }}
        >
          <FaBell className="w-6 h-6" />
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
            style={{ background: theme.primary, borderColor: theme.surface }}
          ></span>
        </button>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow border-2"
          style={{
            background: theme.accent,
            color: theme.primary,
            borderColor: theme.surface,
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
