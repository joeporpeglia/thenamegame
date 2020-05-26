import React, {
  useState,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  createGame,
  useGame,
  addPrompt,
  kickPlayer,
  setReady,
  removePrompt,
} from "./Games";

const savedName = localStorage.getItem("@thenamegame/saved-name");

export default function App() {
  const [name, setName] = useState(savedName || "");
  const [url, dispatchUrl] = useUrl();
  const { pathname } = url;

  const gameId = useMemo(() => {
    if (pathname.length > 0 && pathname !== "/") {
      return pathname.replace("/", "");
    }

    return null;
  }, [pathname]);

  async function handleLogin(name: string) {
    localStorage.setItem("@thenamegame/saved-name", name);
    setName(name);
  }

  async function handleCreateGame() {
    const gameId = await createGame(name);
    dispatchUrl("/" + gameId);
  }

  if (!name) {
    return <Login handleLogin={handleLogin} />;
  }

  if (!gameId) {
    return <button onClick={handleCreateGame}>Create game</button>;
  }

  return (
    <Suspense fallback={null}>
      <Game gameId={gameId} name={name} />
    </Suspense>
  );
}

function Login(props: { handleLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => props.handleLogin(name)}>Set name</button>
    </div>
  );
}

function Game(props: { gameId: string; name: string }) {
  const { gameId, name } = props;
  const [draftPrompt, setDraftPrompt] = useState("");

  const game = useGame(gameId, name);

  function handleAddPrompt() {
    addPrompt(gameId, draftPrompt);
    setDraftPrompt("");
  }

  function handleKickPlayer(player: string) {
    if (player === name) {
      return undefined;
    }

    return () => kickPlayer(gameId, player);
  }

  function handleToggleReady(player: string) {
    if (player !== name) {
      return undefined;
    }

    return () => setReady(gameId, player, !game.readyPlayers.includes(player));
  }

  function handleRemovePrompt(prompt: string) {
    removePrompt(gameId, prompt);
  }

  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <div>
        Invite others with this link:
        <a href={`${window.location.host}/${gameId}`}>
          {window.location.host}/{gameId}
        </a>
      </div>
      <div>
        <h3>Players:</h3>
        <ol>
          {game.players.map((p) => (
            <li key={p}>
              <PlayerDetails
                name={p}
                isReady={game.readyPlayers.includes(p)}
                handleKick={handleKickPlayer(p)}
                handleToggleReady={handleToggleReady(p)}
              />
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3>Prompts</h3>
        <input
          type="text"
          value={draftPrompt}
          onChange={(e) => setDraftPrompt(e.target.value)}
          placeholder="Enter the name of a thing"
        />
        <button onClick={handleAddPrompt}>Add prompt</button>
        <ol>
          {game.prompts.map((p) => (
            <li key={p}>
              {p} -{" "}
              <button onClick={() => handleRemovePrompt(p)}>Remove</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PlayerDetails(props: {
  name: string;
  isReady?: boolean;
  handleKick?: () => void;
  handleToggleReady?: () => void;
}) {
  const { name, isReady, handleToggleReady, handleKick } = props;
  return (
    <>
      {name}
      <label>
        <input
          type="checkbox"
          checked={isReady}
          onChange={handleToggleReady}
          readOnly={handleToggleReady == null}
          disabled={handleToggleReady == null}
        />
        Player ready
      </label>
      {handleKick ? <button onClick={handleKick}>Kick</button> : null}
    </>
  );
}

function useUrl() {
  const [url, setUrl] = useState(new URL(window.location.href));

  function handleUrlChange() {
    console.log("history change");
    setUrl(new URL(window.location.href));
  }

  useEffect(() => {
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const handleSetUrl = useCallback((href: string) => {
    window.history.pushState(null, "", href);
    handleUrlChange();
  }, []);

  return [url, handleSetUrl] as const;
}
