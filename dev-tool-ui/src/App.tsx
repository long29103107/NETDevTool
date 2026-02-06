import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import ApiExplorerPage from "./pages/ApiExplorerPage";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ApiExplorerPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
