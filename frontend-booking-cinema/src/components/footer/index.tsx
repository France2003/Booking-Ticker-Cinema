import { Facebook, Instagram, Youtube } from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "../../assets/img/logoCinema.jpg"
import MapSection from "./MapSection"

export default function Footer() {
  return (
    <footer className="bg-[#07122B] text-white text-sm pt-10 pb-5 border-t border-gray-700 relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 relative z-10">

        {/* Social icons */}
        <div className="flex justify-center space-x-5 mb-8 border-b border-gray-600 pb-6">
          {[
            { Icon: Facebook, link: "https://www.facebook.com/profile.php?id=61583030121238" },
            { Icon: Instagram, link: "https://www.instagram.com/_buiphap_/" },
            { Icon: Youtube, link: "https://youtube.com" },
          ].map(({ Icon, link }, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-400 p-2 rounded-full hover:bg-[#00E5FF] hover:text-[#07122B] transition-all duration-300 hover:scale-110"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-gray-300 mb-10">
          <div>
            <h3 className="text-3xl font-extrabold mb-3">
              <span className="text-orange-600 drop-shadow-md">France</span>{" "}
              <span className="text-white">Cinema</span>
            </h3>

            <p className="font-semibold text-white leading-relaxed">
              TẦNG 1 FRANCE CENTER,<br />
              ĐƯỜNG 566 NÚI THÀNH, HẢI CHÂU, ĐÀ NẴNG
            </p>

            <a
              href="https://www.google.com/maps/place/France+Cinema+-+Helio+Center+Da+Nang/@16.0594035,108.2213118,19z/data=!4m6!3m5!1s0x314219d1ef8b19f3:0x1c72de2e6e91fca9!8m2!3d16.0594035!4d108.2213118!16s%2Fg%2F11v0r9vm3p?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#00E5FF] hover:underline mt-3 group"
            >
              <div className="relative">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                  alt="Google Maps"
                  className="w-6 h-6 transition-transform duration-300 group-hover:scale-125"
                />
                <span className="absolute -top-2 -right-2 w-2 h-2 bg-[#00E5FF] rounded-full animate-ping"></span>
              </div>
              Xem bản đồ
            </a>

            <p className="mt-3 text-xs leading-relaxed">
              Tên doanh nghiệp: <strong>Công Ty TNHH France Cinema</strong>
              <br />
              Giấy CNĐKKD: 0400668112 - Cấp ngày 21/12/2016
              <br />
              Cơ quan cấp: Phòng Đăng ký kinh doanh - Sở KH&ĐT Đà Nẵng
              <br />
              Địa chỉ: 566 Núi Thành, Hoà Cường Nam, Hải Châu, Đà Nẵng, Việt Nam
              <br />
              Điện thoại: 0363 977 687
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase mb-3 tracking-wide">
              France Cinema
            </h4>
            <ul className="space-y-2 uppercase">
              <li><Link to="/about" className="hover:text-[#00E5FF] transition-colors">Giới thiệu</Link></li>
              <li><Link to="/careers" className="hover:text-[#00E5FF] transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/contact" className="hover:text-[#00E5FF] transition-colors">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase mb-3 tracking-wide">
              Thông tin chung
            </h4>
            <ul className="space-y-2 uppercase">
              <li><Link to="/terms" className="hover:text-[#00E5FF] transition-colors">Điều khoản chung</Link></li>
              <li><Link to="/faq" className="hover:text-[#00E5FF] transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/transaction-terms" className="hover:text-[#00E5FF] transition-colors">Điều khoản giao dịch</Link></li>
            </ul>
            <div className="mt-5">
              <img
                src="https://www.metiz.vn/static/assets/websites/images/icon-dathongbao.png"
                alt="Đã thông báo Bộ Công Thương"
                className="w-32 opacity-90 hover:opacity-100 transition"
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <MapSection />
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
          <p className="mb-2">Một sản phẩm đến từ <strong>Khởi Phát Ltd.</strong></p>
          <div className="flex items-center justify-center gap-2">
            <img src={Logo} alt="France Cinema Logo" className="w-6 h-6 opacity-90" />
            <span>Bản quyền © 2025 France Cinema</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#00E5FF]/20 to-transparent blur-3xl"></div>
    </footer>
  )
}
