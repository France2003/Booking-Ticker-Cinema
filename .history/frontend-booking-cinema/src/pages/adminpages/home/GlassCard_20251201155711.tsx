import { motion } from "framer-motion";
import CountUp from "react-countup";
const GlassCard = ({
    title,
    icon,
    value,
    subValue,
    money
}: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
            className="
        p-6 rounded-3xl shadow-xl backdrop-blur-2xl bg-white/30
        border border-white/40 hover:shadow-2xl hover:scale-105 transition
      "
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="text-indigo-600 text-3xl">{icon}</div>
                <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
            </div>

            <p className="text-3xl font-extrabold text-indigo-700">
                <CountUp end={value} duration={1.4} separator="," />
                {money && " VNĐ"}
            </p>

            {subValue && (
                <p className="text-sm text-gray-600 mt-1">{subValue}</p>
            )}
        </motion.div>
    );
};

export default GlassCard;
