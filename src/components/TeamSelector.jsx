import { Link } from "react-router-dom";

const teams = [
  { slug: "bavap", name: "BAVAP" },
  { slug: "c-class-heroes", name: "C-Class Heroes" },
];

export default function TeamSelector() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">2026 Dodgeball Toronto Kickoff</h1>
      <p className="text-gray-600 mb-8">Select your team</p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {teams.map((team) => (
          <Link
            key={team.slug}
            to={`/${team.slug}`}
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <span className="text-xl font-semibold text-gray-800">{team.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
