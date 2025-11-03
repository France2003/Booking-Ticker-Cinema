export const isHotMovie = (movie: any): boolean => {
  if (movie.isHot) return true; 
  const luotXem = Number(movie.luotXem) || 0;
  // const danhGia = Number(movie.danhGia) || 0;
  return luotXem > 50000 ;
};