import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser, loginAdmin } from "../../services/authLogin/authLogin";
import AuthForm from "../../components/auth/AuthForm";
import AuthLayout from "../../components/AuthLayout";
import ImgBackground from "../../assets/img/bgrimg.jpg";
import { useUser } from "../../contexts/UserContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role] = useState<"user" | "admin">("user"); //setRole
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const loginFn = role === "admin" ? loginAdmin : loginUser;
            const data = await loginFn({ email, password });
            console.log(`[${role.toUpperCase()} LOGIN] API Response:`, data);
            await login(data.token);
            if (data.user.role === "admin") {
                toast.success("Đăng nhập quản trị thành công!");
                setTimeout(() => navigate("/dashboard"), 1200);
            } else {
                toast.success("Đăng nhập thành công!");
                setTimeout(() => navigate("/"), 1200);
            }
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                "Đăng nhập thất bại!";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login min-h-screen flex items-center justify-center bg-gray-900 text-black">
            <Helmet>
                <title>Đăng Nhập | Booking Cinema</title>
            </Helmet>

            <AuthLayout rightBgUrl={ImgBackground}>
                <AuthForm
                    type="login"
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isLoading={isLoading}
                    onSubmit={handleLogin}
                />
            </AuthLayout>
        </div>
    );
}

export default Login;
