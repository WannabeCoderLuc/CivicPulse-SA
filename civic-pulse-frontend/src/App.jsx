import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/shared/Navbar";
import DashboardPage from "@/pages/DashboardPage";
import MapPage from "@/pages/MapPage";
import ReportPage from "@/pages/ReportPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ReportsPage from "@/pages/ReportsPage";



export default function App() {

  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster position="top-right" />
        <div className="flex min-h-screen bg-gray-950">
          <Navbar />
          <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

function NotFoundPage() {

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl mb-4">???</p>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm">This route does not exist in the CivicPulse SA system.</p>
    </div>
  );
}
