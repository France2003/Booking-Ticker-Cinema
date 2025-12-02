import Footer from "../../components/footer"
import Header from "../../components/header"
import { Outlet } from "react-router-dom"
import { UserProvider } from "../../contexts/UserContext"
import { FiSearch, FiMessageCircle } from "react-icons/fi"
import { useState } from "react"
import { motion } from "framer-motion"
import SearchMoviePopup from "../../pages/homepages/MoviePage/SearchMoviePopup"
const DefaultLayout = () => {
  const [openSearch, setOpenSearch] = useState(false)
  
  return (
    <UserProvider>
      <div className="default-layout relative">
        <Header />

        <main>
          <Outlet />
        </main>

        <Footer />
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[999] flex flex-col gap-4"
        >
          {/* Search Button */}
          <motion.button
            onClick={() => setOpenSearch(true)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                "0 0 10px rgba(255,255,255,0.2)",
                "0 0 18px rgba(255,255,255,0.35)",
                "0 0 10px rgba(255,255,255,0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 flex items-center justify-center rounded-full 
              bg-gradient-to-br from-[#1e2f47] to-[#0c1522]
              border border-white/20 shadow-xl hover:shadow-2xl"
          >
            <FiSearch className="text-white text-2xl" />
          </motion.button>
          {/* Message Button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.open("https://m.me/894693447052340", "_blank")} // ← mở Messenger
            animate={{
              y: [0, -8, 0],
              boxShadow: [
                "0 0 12px rgba(255,140,40,0.4)",
                "0 0 22px rgba(255,140,40,0.6)",
                "0 0 12px rgba(255,140,40,0.4)",
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-14 h-14 flex items-center justify-center rounded-full 
    bg-gradient-to-br from-orange-500 to-red-400
    shadow-xl hover:shadow-2xl hover:shadow-orange-400/30"
          >
            <FiMessageCircle className="text-white text-2xl" />
          </motion.button>
        </motion.div>
        {/* Popup Search */}
        {openSearch && <SearchMoviePopup onClose={() => setOpenSearch(false)} />}
      </div>
    </UserProvider>
  )
}

export default DefaultLayout
