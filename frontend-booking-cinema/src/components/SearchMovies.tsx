import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
interface SearchMoviesProps {
    onSearch: (keyword: string) => void;
}
const SearchMovies: React.FC<SearchMoviesProps> = ({ onSearch }) => {
    const [keyword, setKeyword] = useState<string>("");

    const handleSearch = () => {
        onSearch(keyword);
    };
    return (
        <div className="flex items-center w-1/2 md:w-1/3 lg:w-1/4">
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="p-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                    onClick={handleSearch}
                    className="absolute right-0 top-[1px] p-[12px] bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                >
                    <FiSearch />
                </button>
            </div>
        </div>
    );
};

export default SearchMovies;
