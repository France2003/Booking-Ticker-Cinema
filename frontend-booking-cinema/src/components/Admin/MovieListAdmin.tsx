import React, { useState, useEffect, useRef } from "react";
import EditMovieModal from "./EditMovieModal";
import DeleteMovieModal from "./DeleteMovieModal";
import { MoreVertical } from "lucide-react";
import type { Movie } from "../../types/movies/movie.types";

interface MovieListProps {
    movies: Movie[];
    title: string;
    onReload: () => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, title, onReload }) => {
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [deleteMovieData, setDeleteMovieData] = useState<Movie | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Ẩn menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <h3 className="text-xl font-semibold mb-4">{title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <div
                            key={movie.maPhim}
                            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition relative"
                        >
                            <div className="relative">
                                <img
                                    src={`http://localhost:3001${movie.anhPoster}`}
                                    alt={movie.tieuDe}
                                    className="w-full h-60 object-cover rounded-md mb-4"
                                />

                                <button
                                    onClick={() =>
                                        setMenuOpen(menuOpen === movie._id ? null : movie._id || "")
                                    }
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {menuOpen === movie._id && (
                                    <div
                                        ref={menuRef}
                                        className="absolute top-10 right-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fadeIn"
                                    >
                                        <button
                                            onClick={() => {
                                                setSelectedMovie(movie);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeleteMovieData(movie);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3
                                className="text-lg font-semibold truncate" title={movie.tieuDe}> {movie.tieuDe}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-4 mb-4">
                                {movie.moTa}
                            </p>
                            <div className="flex flex-wrap justify-between text-sm text-gray-600 mt-2">
                                <p className="w-1/2 pr-2 truncate">
                                    <span className="font-medium text-gray-700">Thể loại:</span> {movie.theLoai}
                                </p>
                                <p className="w-1/2 pl-2 truncate text-right">
                                    <span className="font-medium text-gray-700">Đạo diễn:</span> {movie.daoDien}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có phim {title.toLowerCase()}</p>
                )}
            </div>
            {selectedMovie && (
                <EditMovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onSuccess={() => {
                        setSelectedMovie(null);
                        onReload();
                    }}
                />
            )}
            {deleteMovieData && (
                <DeleteMovieModal
                    movieId={deleteMovieData._id}
                    movieTitle={deleteMovieData.tieuDe}
                    onClose={() => setDeleteMovieData(null)}
                    onSuccess={() => {
                        setDeleteMovieData(null);
                        onReload();
                    }}
                />
            )}
        </>
    );
};

export default MovieList;
