import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
interface TrailerModalProps {
    trailerUrl: string
    isOpen: boolean
    onClose: () => void
}
export default function TrailerModal({ trailerUrl, isOpen, onClose }: TrailerModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-[90%] max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {trailerUrl.endsWith(".mp4") ? (
                            <video
                                src={trailerUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <iframe
                                src={trailerUrl}
                                title="Trailer"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
