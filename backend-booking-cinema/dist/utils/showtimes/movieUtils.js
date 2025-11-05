"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHotMovie = void 0;
const isHotMovie = (movie) => {
    if (movie.isHot)
        return true;
    const luotXem = Number(movie.luotXem) || 0;
    // const danhGia = Number(movie.danhGia) || 0;
    return luotXem > 50000;
};
exports.isHotMovie = isHotMovie;
