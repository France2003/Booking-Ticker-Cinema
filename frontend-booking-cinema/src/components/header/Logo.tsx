import LogoCinema from "../../assets/img/logoCinema.jpg";

const LogoMetiz = () => {
    return (
        <div className="flex items-center gap-3 group">
            <img
                src={LogoCinema}
                alt="Metiz Cinema"
                className="h-25 w-25 object-cover rounded-full border-4 shadow-lg"
            />
            <div className="flex flex-col leading-tight">
                <span
                    className="glow-text text-3xl font-extrabold tracking-wide 
          bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 
          bg-clip-text text-transparent 
          hover:from-cyan-300 hover:to-pink-400 transition-all duration-500"
                >
                    FRANCE
                </span>
                <span
                    className="glow-text text-3xl font-extrabold tracking-wide 
          bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 
          bg-clip-text text-transparent 
          hover:from-cyan-300 hover:to-pink-400 transition-all duration-500"
                >
                    CINEMA
                </span>
            </div>
        </div>
    );
};

export default LogoMetiz;
