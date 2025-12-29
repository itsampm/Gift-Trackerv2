import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import KidProfile from "./pages/KidProfile";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <div className="App min-h-screen">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kid/:kidId" element={<KidProfile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;