import { motion } from "framer-motion";
const TopListCard = ({ title, data }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .6 }}
      className="
        p-6 rounded-3xl shadow-xl backdrop-blur-2xl bg-white/30
        border border-white/40 hover:shadow-2xl transition
      "
    >
      <h3 className="text-xl font-bold mb-4 text-indigo-700">{title}</h3>

      {data.map((item: any, i: number) => (
        <div key={i} className="flex justify-between border-b py-3">
          <span>{item.label}</span>
          <span className="font-bold text-indigo-600">
            {item.value.toLocaleString()} đ
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default TopListCard;
