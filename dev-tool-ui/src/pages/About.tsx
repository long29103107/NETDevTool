import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold my-4">About DevTool</h1>
      <p className="text-lg text-gray-300 mb-6">
        DevTool UI — served at <code className="bg-[#1a1a1a] px-2 py-1 rounded">/_devtool</code> or <code className="bg-[#1a1a1a] px-2 py-1 rounded">/_devtool/home</code> when running with the API.
      </p>
      <Link to="/" className="text-[#646cff] hover:underline">← Back to Home</Link>
    </div>
  );
}
