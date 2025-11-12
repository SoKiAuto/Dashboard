"use client";

export default function TrendsToolbar({ allTags, selectedTags, setSelectedTags }) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-[#111] border-b border-gray-700 px-4 py-2 text-sm">
      <h2 className="text-lg font-semibold text-[#BDB8AE]">DE4000 Trends</h2>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag, i) => (
          <button
            key={i}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded text-xs font-semibold border ${
              selectedTags.includes(tag)
                ? "bg-[#25458C] text-white border-[#3667b1]"
                : "bg-[#1a1a1a] text-gray-400 border-gray-600 hover:bg-[#2a2a2a]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
