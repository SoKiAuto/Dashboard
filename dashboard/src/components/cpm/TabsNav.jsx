"use client";
export default function TabsNav({ active, onChange }) {
  const tabs = [
    { key: "unit", label: "Unit Trends" },
    { key: "stage", label: "Stage Trends" },
    { key: "cylinder", label: "Cylinder Trends" },
    { key: "custom", label: "Custom Trends" },
  ];

  return (
    <div className="flex gap-2 bg-card text-card-foreground p-2 rounded-2xl shadow">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-xl border transition
            ${active === t.key ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
