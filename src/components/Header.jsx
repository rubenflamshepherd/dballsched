import { useState, useEffect } from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function Header({ teamName, tournamentName, players, selectedPlayer, onPlayerChange }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`bg-gray-800 text-white px-4 sticky top-0 z-50 transition-all ${isScrolled ? 'py-3' : 'py-6'}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{teamName}</h1>
        <FormControl size="small">
          <Select
            value={selectedPlayer}
            onChange={(e) => onPlayerChange(e.target.value)}
            displayEmpty
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.5)",
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <MenuItem value="">All Players</MenuItem>
            {players.map((player) => (
              <MenuItem key={player} value={player}>
                {player}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {!isScrolled && <p className="text-gray-300 mt-1 text-center">{tournamentName}</p>}
    </header>
  );
}
