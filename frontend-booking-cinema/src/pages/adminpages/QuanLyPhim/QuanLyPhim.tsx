import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import { getMovies } from "../../../services/movies/movie";
import SearchMovies from "../../../components/SearchMovies";
import MovieList from "../../../components/Admin/Movies/MovieListAdmin";
import AddMovieForm from "../QuanLyPhim/AddMovieForm";
import type { Movie } from "../../../types/movies/movie.types";
import MovieDeleteHistory from "../QuanLyPhim/HistoryDeleteMovie";
import MoviePagination from "../../../components/Admin/Movies/MoviePagination";

const QuanLyPhim = () => {
  const [dangChieuMovies, setDangChieuMovies] = useState<Movie[]>([]);
  const [sapChieuMovies, setSapChieuMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDangChieu, setTotalDangChieu] = useState(0);
  const [totalSapChieu, setTotalSapChieu] = useState(0);
  const [pageDangChieu, setPageDangChieu] = useState(1);
  const [pageSapChieu, setPageSapChieu] = useState(1);
  const [limit] = useState(8);

  const [activeTab, setActiveTab] = useState<
    "dangChieu" | "sapChieu" | "add" | "Lịch sử xóa"
  >("dangChieu");
  const fetchMovies = async (keyword: string = "") => {
    setLoading(true);
    try {
      const data = await getMovies({keyword,page: activeTab === "dangChieu" ? pageDangChieu : pageSapChieu,limit,
      });

      if (data.dangChieu?.data) {
        setDangChieuMovies(data.dangChieu.data);
        setTotalDangChieu(data.dangChieu.total);
      }

      if (data.sapChieu?.data) {
        setSapChieuMovies(data.sapChieu.data);
        setTotalSapChieu(data.sapChieu.total);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phim:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 load lại khi đổi tab hoặc đổi trang
  useEffect(() => {
    fetchMovies();
  }, [pageDangChieu, pageSapChieu]);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">🎬 Quản lý phim</h2>
        <SearchMovies onSearch={fetchMovies} />
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        {["dangChieu", "sapChieu", "add", "Lịch sử xóa"].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab as "dangChieu" | "sapChieu" | "add" | "Lịch sử xóa")
            }
            className={`p-2 rounded-lg font-medium ${activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-indigo-500 hover:text-white"
              }`}
          >
            {tab === "dangChieu"
              ? "Phim đang chiếu"
              : tab === "sapChieu"
                ? "Phim sắp chiếu"
                : tab === "add"
                  ? "Thêm phim"
                  : "🧾 Lịch sử xóa phim"}
          </button>
        ))}
      </div>
      {loading ? (
        <p>Đang tải danh sách phim...</p>
      ) : (
        <>
          {/* --- PHIM ĐANG CHIẾU --- */}
          {activeTab === "dangChieu" && (
            <>
              <h4 className="text-lg font-medium mb-2">
                Tổng số phim đang chiếu: {totalDangChieu}
              </h4>
              <MovieList
                movies={dangChieuMovies}
                title="Phim đang chiếu"
                onReload={fetchMovies}
              />
              <MoviePagination
                currentPage={pageDangChieu}
                total={totalDangChieu}
                limit={limit}
                onPageChange={(p) => setPageDangChieu(p)}
              />
            </>
          )}
          {activeTab === "sapChieu" && (
            <>
              <h4 className="text-lg font-medium mb-2">
                Tổng số phim sắp chiếu: {totalSapChieu}
              </h4>
              <MovieList
                movies={sapChieuMovies}
                title="Phim sắp công chiếu"
                onReload={fetchMovies}
              />
              <MoviePagination
                currentPage={pageSapChieu}
                total={totalSapChieu}
                limit={limit}
                onPageChange={(p) => setPageSapChieu(p)}
              />
            </>
          )}
          {activeTab === "add" && (
            <AddMovieForm
              onSuccess={() => {
                fetchMovies();
                setActiveTab("dangChieu");
              }}
            />
          )}
          {activeTab === "Lịch sử xóa" && <MovieDeleteHistory />}
        </>
      )}
    </AdminLayout>
  );
};

export default QuanLyPhim;
