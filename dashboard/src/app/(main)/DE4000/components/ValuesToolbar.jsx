"use client";

export default function ValuesToolbar({ currentTab, setTab }) {
  const tabs = [
    "T1", "T2", "T3", "T4", "T5",
    "Temp", "Pres", "Vibr", "Volt",
    "Percent", "Curr. Loop", "Discrete",
    "Other", "All"
  ];

  return (
    <div className="flex flex-wrap justify-center gap-1 bg-[#111] py-2 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setTab(tab)}
          className={`px-3 py-1 text-[12px] font-semibold rounded-sm ${
            currentTab === tab
              ? "bg-[#25458C] text-white"
              : "bg-[#333] text-gray-300 hover:bg-[#444]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
