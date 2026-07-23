import { motion } from "framer-motion";
import InfrastructureMap from "@/components/features/InfrastructureMap";

export default function MapPage() {
  console.log("ENTER: MapPage render");
  return (
    <div className="space-y-4">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Infrastructure Map
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time geo-spatial view of all reported municipal incidents  City of Cape Town
        </p>
      </div>
      <InfrastructureMap />
    </div>
  );
}
