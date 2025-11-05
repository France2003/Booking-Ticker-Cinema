
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
import QuanLyNguoiDung from './pages/adminpages/QuanLyNguoiDung/QuanLyNguoiDung'
import QuanLyKhuyenMai from './pages/adminpages/QuanLyKhuyenMai/QuanLyKhuyenMai'
import Profile from './pages/homepages/profile/Profile'
import QuanLyDatVeXemPhim from './pages/adminpages/QuanLyDatVeXemPhim/QuanLyDatVeXemPhim'
import QuanLyPhongChieu from './pages/adminpages/QuanLyRap/QuanLyRap'
import PromotionsPage from './pages/homepages/Promotions/PromotionsPage'
import PromotionDetailPage from './pages/homepages/Promotions/PromotionDetailPage'
import ContactPage from './components/footer/ContactPage'
import NowShowingPage from './pages/homepages/MoviePage/NowShowingMoviesPage'
import ComingSoonPage from './pages/homepages/MoviePage/UpcomingMoviesPage'
import MovieDetailPage from './pages/homepages/MoviePage/MovieDetailPage'
import QuanLyBinhLuan from './pages/adminpages/QuanLyBinhLuan/QuanLyBinhLuan'
import ShowTimesPage from './pages/homepages/ShowTimes/ShowTimes'
import BookingPage from './pages/homepages/Booking/BookingPage'
import PaymentResultPage from './pages/homepages/Booking/PaymentResultPage'
import MyTicketsPage from './pages/homepages/Booking/MyTicketsPage'
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
          <Route path='/promotions' element={<PromotionsPage />}/>
          <Route path="/promotions/:id" element={<PromotionDetailPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/phim-dang-chieu' element={<NowShowingPage />} />
          <Route path='/phim-sap-cong-chieu' element={<ComingSoonPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/lich-chieu" element={<ShowTimesPage />} />
           <Route path="/booking/:id" element={<BookingPage />} />
           <Route path="/payment-result" element={<PaymentResultPage />} />
           <Route path="/user/my-tickets" element={<MyTicketsPage />} />
        </Route>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/quan-ly-phim" element={<QuanLyPhim />} />
        <Route path="/quan-ly-dat-ve-xem-phim" element={<QuanLyDatVeXemPhim />} />
        <Route path="/quan-ly-xuat-chieu" element={<QuanLyXuatChieu />} />
        <Route path="/quan-ly-phong-chieu" element={<QuanLyPhongChieu />} />
        <Route path="/quan-ly-nguoi-dung" element={<QuanLyNguoiDung />} />
        <Route path="/quan-ly-khuyen-mai" element={<QuanLyKhuyenMai />} />
        <Route path="/quan-ly-binh-luan" element={<QuanLyBinhLuan />} />
      </Routes>
    </>

  )
}

export default App
