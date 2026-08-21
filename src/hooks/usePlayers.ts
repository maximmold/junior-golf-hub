import { useState, useEffect } from 'react';
import { Player } from '../types/tournament';
import { loadPlayers, savePlayers } from '../services/storageService';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>(loadPlayers);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('ALL');

  useEffect(() => {
    savePlayers(players);
  }, [players]);

  const addPlayer = (newPlayerData: Omit<Player, 'id'>) => {
    const id = `player-${Date.now()}`;
    const newPlayer: Player = {
      id,
      ...newPlayerData,
    };
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  };

  const updatePlayer = (id: string, updatedData: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlayerId === id) {
      setSelectedPlayerId('ALL');
    }
  };

  return {
    players,
    selectedPlayerId,
    setSelectedPlayerId,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setPlayers,
  };
}
