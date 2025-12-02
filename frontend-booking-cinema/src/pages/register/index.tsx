import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../services/authRegister/authService";
import AuthForm from "../../components/auth/AuthForm";
import AuthLayout from "../../components/AuthLayout";
import ImgBackground from "../../assets/img/bgrimg.jpg";
function Register() {
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser({fullname, dateofbirth, phone, email, password });
      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register min-h-screen flex items-center justify-center bg-gray-900 text-black">
      <Helmet>
        <title>Đăng Ký | France Cinema</title>
      </Helmet>
      <AuthLayout rightBgUrl={ImgBackground}>
        <AuthForm
          type="register"
          fullname={fullname}
          setFullname={setFullname}
          dateofbirth={dateofbirth}
          setDateofbirth={setDateofbirth}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          onSubmit={handleRegister}
        />
      </AuthLayout>
    </div>
  );
}

export default Register;
