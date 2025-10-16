// src/pages/adminpages/QuanLyPhim/QuanLyPhim.tsx
import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import { getMovies } from "../../../services/movies/movie";
import SearchMovies from "../../../components/SearchMovies";
import MovieList from "../../../components/Admin/MovieListAdmin";
import AddMovieForm from "../QuanLyPhim/AddMovieForm";
import type { Movie } from "../../../types/movies/movie.types";
const QuanLyPhim = () => {
  const [dangChieuMovies, setDangChieuMovies] = useState<Movie[]>([]);
  const [sapChieuMovies, setSapChieuMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDangChieu, setTotalDangChieu] = useState(0);
  const [totalSapChieu, setTotalSapChieu] = useState(0);
  const [activeTab, setActiveTab] = useState<"dangChieu" | "sapChieu" | "add">("dangChieu");

  const fetchMovies = async (keyword: string = "") => {
    setLoading(true);
    try {
      const data = await getMovies({ keyword });

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

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Quản lý phim</h2>
        <SearchMovies onSearch={fetchMovies} />
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab("dangChieu")}
          className={`p-2 rounded-lg font-medium ${activeTab === "dangChieu"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-indigo-500 hover:text-white"
            }`}
        >
          Phim đang chiếu
        </button>
        <button
          onClick={() => setActiveTab("sapChieu")}
          className={`p-2 rounded-lg font-medium ${activeTab === "sapChieu"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-indigo-500 hover:text-white"
            }`}
        >
          Phim sắp chiếu
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`p-2 rounded-lg font-medium ${activeTab === "add"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-indigo-500 hover:text-white"
            }`}
        >
          Thêm phim
        </button>
      </div>
      {loading ? (
        <p>Đang tải danh sách phim...</p>
      ) : (
        <>
          {activeTab === "dangChieu" && (
            <>
              <h4 className="text-lg font-medium mb-2">
                Tổng số phim đang chiếu: {totalDangChieu}
              </h4>
              <MovieList movies={dangChieuMovies} title="Phim đang chiếu"  onReload={fetchMovies} />
            </>
          )}

          {activeTab === "sapChieu" && (
            <>
              <h4 className="text-lg font-medium mb-2">
                Tổng số phim sắp chiếu: {totalSapChieu}
              </h4>
              <MovieList movies={sapChieuMovies} title="Phim sắp chiếu"  onReload={fetchMovies} />
            </>
          )}

          {activeTab === "add" && (
            <AddMovieForm onSuccess={() => {
              fetchMovies();
              setActiveTab("dangChieu");
            }} />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default QuanLyPhim;
