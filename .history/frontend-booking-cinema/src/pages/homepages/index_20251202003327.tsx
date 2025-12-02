import { motion } from "framer-motion"
import Slides from "../../components/Slides"
import MovieTabs from "./MovieTab/MovieTabs"
import Promotions from "./Promotions/Promotions"
import { Helmet } from "react-helmet"
const HomePages = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white bg-[#0F1D2F]">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Trang chủ</title>
      </Helmet>
      <section className="relative w-full overflow-hidden pb-2">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1D2F] via-[#0d1624] to-[#0b1420] z-0" />
        <div className="relative z-10 flex flex-col gap-2 lg:gap-4">
          <div className="pt-3 px-3 sm:px-6 md:px-10 lg:px-16">
            <div className="max-w-[1400px] py-16 mx-auto">
              <Slides />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative w-full flex items-center justify-center py-3 -mt-1"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,120,35,0.08),transparent_80%)]" />
            <motion.div
              className="relative text-center font-extrabold uppercase tracking-[3px] sm:tracking-[5px] text-white text-base sm:text-lg md:text-xl select-none"
              animate={{
                textShadow: [
                  "0 0 8px rgba(255,180,80,0.7)",
                  "0 0 16px rgba(255,230,160,0.9)",
                  "0 0 8px rgba(255,180,80,0.7)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="relative inline-block">
                ✦{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-200 to-red-400 bg-clip-text text-transparent">
                  France Cinematic Experience
                </span>{" "}
                ✦
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section
        className="relative w-full pt-4 pb-8 md:pb-12 -mt-[6px] overflow-hidden"
        style={{
          backgroundImage:
            'url("https://metiz.vn/static/assets/websites/images/bg-session-movie.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative -mt-[30px] z-10">
          <MovieTabs />
        </div>
      </section>
      <section className="relative -mt-[50px]">
        <Promotions />
      </section>
    </div>
  )
}

export default HomePages
