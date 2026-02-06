import { Routes, Route } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default App;
