import Logo from "../../assets/img/logoCinema.jpg"

export default function MapSection() {
    return (
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg group">
            {/* Google Map */}
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.7977033917875!2d108.2213117759024!3d16.05940348460407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219d1ef8b19f3%3A0x1c72de2e6e91fca9!2sFrance%20Cinema%20-%20Helio%20Center%20Da%20Nang!5e0!3m2!1svi!2s!4v1730246216952!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="France Cinema – Địa chỉ"
            ></iframe>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] flex flex-col items-center pointer-events-none">
                <div className="bg-white/90 p-1 rounded-full shadow-lg border-2 border-[#00E5FF] group-hover:scale-110 transition-transform duration-300">
                    <img
                        src={Logo}
                        alt="France Cinema Marker"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                </div>
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-[#00E5FF] mt-1" />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#07122B]/90 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                🎥 France Cinema Center, Đà Nẵng
            </div>
        </div>
    )
}
