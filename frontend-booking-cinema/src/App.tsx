
import { Route, Routes } from 'react-router-dom'
import './App.css'
import DefaultLayOut from './layouts/defaulayout/layout'
import HomePages from './pages/homepages'
import Register from './pages/register'
import Login from './pages/login'
import { ToastContainer } from 'react-toastify'
import ForgotPassword from './pages/ForgotPassword'
import DashboardHome from './pages/adminpages/home/DashboardHome'
import QuanLyPhim from './pages/adminpages/QuanLyPhim/QuanLyPhim'
import QuanLyXuatChieu from './pages/adminpages/QuanLyXuatChieu/QuanLyXuatChieu'
import QuanLyRap from './pages/adminpages/QuanLyRap/QuanLyRap'
import QuanLyNguoiDung from './pages/adminpages/QuanLyNguoiDung/QuanLyNguoiDung'
import QuanLyKhuyenMai from './pages/adminpages/QuanLyKhuyenMai/QuanLyKhuyenMai'
import Profile from './pages/homepages/profile/Profile'
import QuanLyDatVeXemPhim from './pages/adminpages/QuanLyDatVeXemPhim/QuanLyDatVeXemPhim'
function App() {

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ForgotPassword />} />
        <Route path='/' element={<DefaultLayOut />}>
          <Route index element={<HomePages />} />
          <Route path='/profile' element={<Profile />} />
        </Route>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/quan-ly-phim" element={<QuanLyPhim />} />
        <Route path="/quan-ly-dat-ve-xem-phim" element={<QuanLyDatVeXemPhim />} />
        <Route path="/quan-ly-xuat-chieu" element={<QuanLyXuatChieu />} />
        <Route path="/quan-ly-rap" element={<QuanLyRap />} />
        <Route path="/quan-ly-nguoi-dung" element={<QuanLyNguoiDung />} />
        <Route path="/quan-ly-khuyen-mai" element={<QuanLyKhuyenMai />} />
      </Routes>
    </>

  )
}

export default App
