import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import KidProfile from "./pages/KidProfile";
import ChristmasChecklist from "./pages/ChristmasChecklist";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className="App min-h-screen">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/kid/:kidId" element={<KidProfile darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/christmas" element={<ChristmasChecklist darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;