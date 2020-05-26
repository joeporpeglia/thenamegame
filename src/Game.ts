export const MaxPromptCount = 50;

export type Player = {
  name: string;
  ready?: boolean;
};

export type Prompt = {
  title: string;
  description?: string;
  playerId: string;
  promptId: string;
};

export type CompletedPrompt = {
  promptId: string;
  teamId: string;
};

export type Team = {
  teamId: string;
  playerIds: string[];
  currentPlayerId: string;
};

export type Game = {
  gameId: string;
  prompts: string[];
  players: string[];
  readyPlayers: string[];
};
