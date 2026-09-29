"""Lógica de chaveamento (funções puras, sem banco).

Porta para o backend as regras de Frontend/src/utils/bracket.ts:
  - pontos corridos: "método do círculo" (todos contra todos);
  - eliminatória: pareia de dois em dois; com número ímpar, um time avança direto (bye).
"""
import random
from datetime import datetime, timedelta
from typing import NamedTuple, Optional


class Confronto(NamedTuple):
    rodada: int
    team_a_id: int
    team_b_id: Optional[int]  # None = bye


def round_robin(team_ids: list[int]) -> list[Confronto]:
    times: list[Optional[int]] = list(team_ids)
    if len(times) % 2 == 1:
        times.append(None)  # número ímpar: None = folga

    total = len(times)
    partidas: list[Confronto] = []
    for rodada in range(1, total):
        for i in range(total // 2):
            a, b = times[i], times[total - 1 - i]
            if a is not None and b is not None:
                partidas.append(Confronto(rodada, a, b))
        # gira: o último vai para a posição 1 (a posição 0 fica parada)
        times.insert(1, times.pop())
    return partidas


def elimination_round(team_ids: list[int], rodada: int) -> list[Confronto]:
    partidas: list[Confronto] = []
    for i in range(0, len(team_ids), 2):
        team_b = team_ids[i + 1] if i + 1 < len(team_ids) else None
        partidas.append(Confronto(rodada, team_ids[i], team_b))
    return partidas


def shuffled(team_ids: list[int]) -> list[int]:
    copia = list(team_ids)
    random.shuffle(copia)
    return copia


def match_winner(team_a_id: int, team_b_id: Optional[int], score_a: int, score_b: int, status: str) -> Optional[int]:
    """Vencedor da partida (None se não terminou ou se empatou)."""
    if status != "FINALIZADO":
        return None
    if team_b_id is None:
        return team_a_id
    if score_a > score_b:
        return team_a_id
    if score_b > score_a:
        return team_b_id
    return None


def suggested_time(data_inicio: Optional[datetime], formato: str, rodada: int, ordem: int) -> datetime:
    """Horário sugerido (UTC naive): 1 h entre jogos da mesma rodada;
    pontos corridos = 1 rodada por semana, mata-mata = 1 fase por dia.
    Parte de `data_inicio`, então mantém o horário escolhido pelo organizador."""
    base = data_inicio or datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    dias = 1 if formato == "eliminatoria" else 7
    return base + timedelta(days=(rodada - 1) * dias, hours=ordem)
