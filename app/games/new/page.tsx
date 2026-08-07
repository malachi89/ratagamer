import GameForm from "@/components/GameForm";
import { createGame } from "@/app/actions/data";

export const metadata = { title: "Nuevo juego - RataGamer" };

export default function NewGamePage() {
  return (
    <main className="container page">
      <div className="page-header">
        <div>
          <h1>Nuevo juego</h1>
          <p className="sub">Registra un juego que estés jugando o planees jugar</p>
        </div>
      </div>
      <div style={{ maxWidth: 560 }}>
        <GameForm action={createGame} submitLabel="Crear juego" />
      </div>
    </main>
  );
}
