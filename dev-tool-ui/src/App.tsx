import { Routes, Route } from "react-router-dom";
import "./index.css";
import ApiExplorerPage from "./pages/ApiExplorer";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ApiExplorerPage />} />
    </Routes>
  );
}

export default App;
