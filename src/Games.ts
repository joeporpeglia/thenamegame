import useSwr from "swr";
import { firebase } from "./Firebase";
import { Game } from "./Game";
import { useEffect } from "react";

const { FieldValue } = firebase.firestore;
const firestore = firebase.firestore();

const Games = firestore.collection("games");

export function useGame(gameId: string, name: string): Game {
  const { data, mutate } = useSwr(`/games/${gameId}`, () => getGame(gameId), {
    suspense: true,
    revalidateOnMount: false,
  });

  const game = data!;
  const playerInGame = game.players.includes(name);

  useEffect(() => {
    if (!playerInGame) {
      joinGame(gameId, name);
    }
  }, [gameId, name, playerInGame]);
  useEffect(() => subscribeToGame(gameId, (data) => mutate(data, false)), [
    gameId,
    mutate,
  ]);

  return {
    ...game,
    players: game.players ?? [],
    prompts: game.prompts ?? [],
    readyPlayers: game.readyPlayers ?? [],
  };
}

export async function createGame(): Promise<string> {
  const { id } = Games.doc();
  return id;
}

export function subscribeToGame(gameId: string, handle: (data: Game) => void) {
  return Games.doc(gameId).onSnapshot((doc) => handle(doc.data() as Game));
}

export async function getGame(gameId: string): Promise<Game | null> {
  const doc = await Games.doc(gameId).get();
  return (doc.data() as Game) ?? null;
}

export function joinGame(gameId: string, playerName: string): Promise<void> {
  return Games.doc(gameId).update({
    players: FieldValue.arrayUnion(playerName),
  });
}

export function setReady(
  gameId: string,
  playerName: string,
  ready: boolean
): Promise<void> {
  return Games.doc(gameId).update({
    readyPlayers: ready
      ? FieldValue.arrayUnion(playerName)
      : FieldValue.arrayRemove(playerName),
  });
}

export function kickPlayer(gameId: string, playerName: string): Promise<void> {
  return Games.doc(gameId).update({
    players: FieldValue.arrayRemove(playerName),
  });
}

export async function addPrompt(gameId: string, prompt: string): Promise<void> {
  return Games.doc(gameId).update({
    prompts: FieldValue.arrayUnion(prompt),
  });
}

export async function removePrompt(
  gameId: string,
  prompt: string
): Promise<void> {
  return Games.doc(gameId).update({
    prompts: FieldValue.arrayRemove(prompt),
  });
}
