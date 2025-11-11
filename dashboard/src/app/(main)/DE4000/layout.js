import "../DE4000/styles.css";
import Sidebar from "./components/Sidebar";
import TopStatusBar from "./components/TopStatusBar";

export const metadata = {
  title: "AltrDE4000",
  description: "Main DE4000 Dashboard Application",
};

export default function DE4000Layout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-black text-[#BDB8AE]">
      {/* 🔹 Top Status Bar */}
      <TopStatusBar />

      {/* 🔹 Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-black text-[#BDB8AE]">
          {children}
        </main>
      </div>
    </div>
  );
}
