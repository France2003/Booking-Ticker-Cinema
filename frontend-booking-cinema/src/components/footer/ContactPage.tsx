import { Mail, Phone, MapPin, Clock } from "lucide-react"
import MapSection from "./MapSection"
import { Helmet } from "react-helmet"
export default function ContactPage() {
    return (
        <div className="bg-[#F5F5EF] min-h-screen pt-16 pb-20">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Liên hệ</title>
            </Helmet>
            <div className="max-w-[1200px] mx-auto px-4 md:px-10">
                {/* Header */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B1633] mb-10 uppercase text-center">
                    Liên hệ France Cinema
                </h1>

                {/* Grid: Info + Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    {/* Left: Info */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-5 text-[#0B1633]">
                            Thông tin liên hệ
                        </h2>

                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#00BCD4] mt-1" />
                                <p>
                                    <strong>Địa chỉ:</strong> 556 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-[#00BCD4] mt-1" />
                                <p>
                                    <strong>Hotline:</strong>{" "}
                                    <a
                                        href="tel:02363630689"
                                        className="text-[#00BCD4] hover:underline"
                                    >
                                        0363977687
                                    </a>
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-[#00BCD4] mt-1" />
                                <p>
                                    <strong>Email:</strong>{" "}
                                    <a
                                        href="mailto:bookingtickercinema2025@gmail.com"
                                        className="text-[#00BCD4] hover:underline"
                                    >
                                        bookingtickercinema2025@gmail.com
                                    </a>
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[#00BCD4] mt-1" />
                                <p>
                                    <strong>Giờ mở cửa:</strong> 8h00 – 23h00 mỗi ngày
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact form */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-5 text-[#0B1633]">
                            Gửi phản hồi cho chúng tôi
                        </h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ và tên..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Nhập email..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">
                                    Nội dung
                                </label>
                                <textarea
                                    placeholder="Nhập nội dung bạn muốn gửi..."
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00BCD4] outline-none resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#00BCD4] text-white py-3 rounded-lg font-semibold hover:bg-[#019cb5] transition"
                            >
                                Gửi thông tin
                            </button>
                        </form>
                    </div>
                </div>
                <MapSection />
            </div>
        </div>
    )
}
