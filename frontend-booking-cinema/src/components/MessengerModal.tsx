import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function MessengerModal({ open, onClose }: Props) {
    if (!open) return null;
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-[#0F1D2F] w-[90%] max-w-md rounded-2xl p-6 shadow-xl relative border border-white/10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-300 hover:text-white"
                    >
                        <FiX size={24} />
                    </button>
                    <div className="flex flex-col items-center text-center text-white">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Facebook_Messenger_4_Logo.svg"
                            className="w-16 mb-4"
                        />

                        <h2 className="text-xl font-bold mb-2">
                            Chat với chúng tôi trên Messenger
                        </h2>

                        <p className="text-gray-300 text-sm mb-5">
                            Hỗ trợ đặt vé, tư vấn phim và giải đáp thắc mắc 24/7.
                        </p>
                        <a
                            href="https://m.me/894693447052340"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/40 transition-all"
                        >
                            Mở Messenger
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
