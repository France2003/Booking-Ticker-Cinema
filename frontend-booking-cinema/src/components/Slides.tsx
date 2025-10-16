import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import movies from "../data/movies"
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ")
}
export default function MovieSlider() {
    const [currentIndex, setCurrentIndex] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
    }
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % movies.length)
    }
    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }
    return (
        <div className="w-full">
            <div className="max-w-[1200px] mx-auto px-6">
                <div
                    className="relative w-full 
                     h-[320px] sm:h-[400px] lg:h-[480px] 
                     mx-auto overflow-hidden rounded-lg shadow-lg">
                    <div className="flex transition-transform duration-700 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {movies.map((movie) => (
                            <div key={movie.id} className="min-w-full h-full">
                                <img src={movie.mainImage || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover rounded-lg" />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-3 top-1/2 -translate-y-1/2 
                       h-10 w-10 sm:h-12 sm:w-12 
                       flex items-center justify-center 
                       rounded-full bg-orange-600/80 hover:bg-orange-700 
                       text-white transition-all">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 
                       h-10 w-10 sm:h-12 sm:w-12 
                       flex items-center justify-center 
                       rounded-full bg-orange-600/80 hover:bg-orange-700 
                       text-white transition-all">
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
                <div className="mt-5 flex gap-3 sm:gap-4 lg:gap-5 justify-center flex-wrap">
                    {movies.map((movie, index) => (
                        <button
                            key={movie.id}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "relative w-[100px] h-[60px] sm:w-[140px] sm:h-[80px] lg:w-[180px] lg:h-[100px] rounded-md overflow-hidden transition-all duration-300",
                                currentIndex === index
                                    ? "ring-4 ring-orange-500 scale-105"
                                    : "opacity-70 hover:opacity-100"
                            )}>
                            <img src={movie.thumbnail || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
