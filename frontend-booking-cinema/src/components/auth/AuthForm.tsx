import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FormInput from "../FormInput";
import Button from "../Button";

interface AuthFormProps {
    type: "login" | "register";
    fullname?: string;
    setFullname?: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    phone?: string;
    setPhone?: (val: string) => void;
    dateofbirth?: string;
    setDateofbirth?: (val: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const AuthForm = ({
    type,
    fullname,
    setFullname,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    dateofbirth,
    setDateofbirth,
    isLoading,
    onSubmit,
}: AuthFormProps) => {
    const isLogin = type === "login";

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`w-full bg-white rounded-lg shadow-md p-8 
            ${isLogin ? "max-w-md" : "max-w-2xl"}`}
        >
            <div className="flex items-center justify-center mb-6">
                <h1 className="text-5xl font-extrabold text-center 
                     bg-gradient-to-r from-pink-500 via-yellow-400 to-red-500 
                     bg-clip-text text-transparent tracking-wide">
                    Booking Cinema 🎬
                </h1>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center">
                {isLogin ? "Đăng nhập" : "Đăng ký"}
            </h2>
            <form onSubmit={onSubmit} className={`flex flex-col ${!isLogin ? "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" : "gap-4"}`}>
                {!isLogin && setPhone && (
                    <FormInput
                        label="Số điện thoại"
                        type="text"
                        value={phone || ""}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại của bạn"
                        tabIndex={1}
                    />
                )}
                {!isLogin && setDateofbirth && (
                    <FormInput
                        label="Ngày sinh"
                        type="date"
                        value={dateofbirth || ""}
                        onChange={(e) => setDateofbirth(e.target.value)}
                        placeholder="Chọn ngày sinh của bạn"
                        tabIndex={2}
                    />
                )}
                {!isLogin && setFullname && (
                    <div className="md:col-span-2">
                        <FormInput
                            label="Họ và tên"
                            type="text"
                            value={fullname || ""}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="Nhập họ và tên của bạn"
                            tabIndex={3}
                        />
                    </div>
                )}
                <div className="md:col-span-2">
                    <FormInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        tabIndex={4}
                    />
                </div>

                <div className="md:col-span-2">
                    <FormInput
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showToggle={true}
                        placeholder="Nhập mật khẩu của bạn"
                        tabIndex={5}
                    />
                </div>

                <div className="md:col-span-2">
                    <Button
                        text={isLogin ? "Đăng nhập" : "Đăng ký"}
                        loading={isLoading}
                        type="submit"
                    />
                </div>
            </form>

            {isLogin && (
                <div className="text-right mt-2">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-blue-500 hover:text-blue-400"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>
            )}
            <p className="mt-4 text-center">
                {isLogin ? (
                    <>
                        Chưa có tài khoản?{" "}
                        <Link to="/register" className="text-blue-500 hover:text-blue-400">
                            Đăng ký
                        </Link>
                    </>
                ) : (
                    <>
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-blue-500 hover:text-blue-400">
                            Đăng nhập
                        </Link>
                    </>
                )}
            </p>
        </motion.div>
    );
};

export default AuthForm;
