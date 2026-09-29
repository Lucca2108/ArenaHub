"""Teste de ponta a ponta do fluxo do ArenaHub (só biblioteca padrão).

Uso (com o backend rodando):
    python scripts/smoke_test.py                       # direto no FastAPI (http://localhost:8000)
    python scripts/smoke_test.py http://localhost:3000/api   # passando pelo proxy do Next.js

Cria dados de teste no banco configurado (Neon) e remove o campeonato e as equipes no final.
O usuário de teste (e-mail com sufixo aleatório) permanece; não há rota para removê-lo.
"""
import json
import sys
import urllib.error
import urllib.request
import uuid

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")
TOKEN = None


def call(method, path, body=None, expect=(200, 201, 204)):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            status, raw = resp.status, resp.read()
    except urllib.error.HTTPError as err:
        status, raw = err.code, err.read()
    payload = json.loads(raw) if raw else None
    if status not in expect:
        raise SystemExit(f"FALHOU {method} {path} -> {status}: {payload}")
    return status, payload


def step(n, texto):
    print(f"[{n:>2}] {texto}")


def main():
    global TOKEN
    sufixo = uuid.uuid4().hex[:8]
    email, senha = f"smoke_{sufixo}@arenahub.test", "senha-de-teste-123"

    _, saude = call("GET", "/health/db")
    assert saude == {"status": "ok", "database": "postgresql"}, saude
    step(0, f"health/db -> {saude}")

    call("POST", "/users", {"nome": "Smoke Test", "email": email, "senha": senha, "role": "organizador"})
    step(1, f"usuário criado ({email})")

    _, login = call("POST", "/auth/login", {"email": email, "senha": senha})
    TOKEN = login["access_token"]
    meu_id = login["user"]["id"]
    step(2, f"login ok (user id {meu_id})")

    equipes = []
    for i in range(1, 5):
        _, eq = call("POST", "/teams", {"nome": f"Smoke {sufixo} {i}", "tag": f"S{i}", "cor": "#00f0ff",
                                        "capitao": f"cap{i}", "jogadores": [f"cap{i}", f"p{i}"], "capitao_id": 999999})
        assert eq["capitao_id"] == meu_id, "capitao_id deve vir do JWT"
        equipes.append(eq["id"])
    step(3, f"4 equipes criadas {equipes}")

    _, torneio = call("POST", "/tournaments", {
        "nome": f"Copa Smoke {sufixo}", "jogo": "Valorant", "formato": "eliminatoria", "descricao": "teste",
        "data_inicio": "2026-11-01T22:00:00.000Z", "data_fim": "2026-11-02T02:00:00.000Z",
        "max_equipes": 4, "premiacao": "nada", "organizador_id": 999999})
    tid = torneio["id"]
    assert torneio["organizador_id"] == meu_id, "organizador_id deve vir do JWT, não do corpo"
    assert torneio["team_ids"] == [] and torneio["status"] == "INSCRICOES_ABERTAS"
    step(4, f"campeonato {tid} criado (organizador_id={torneio['organizador_id']}, ignorou 999999)")

    _, lido = call("GET", f"/tournaments/{tid}")
    assert lido["nome"] == torneio["nome"] and lido["data_inicio"].endswith("Z"), lido
    step(5, "campeonato consultado")

    for eid in equipes:
        call("POST", f"/tournaments/{tid}/teams", {"team_id": eid})
    call("POST", f"/tournaments/{tid}/teams", {"team_id": equipes[0]}, expect=(409,))
    _, lido = call("GET", f"/tournaments/{tid}")
    assert lido["team_ids"] == sorted(equipes), lido
    step(6, f"equipes inscritas {lido['team_ids']} (duplicada -> 409)")

    call("POST", f"/tournaments/{tid}/generate-matches")
    _, partidas = call("GET", f"/matches?tournament_id={tid}")
    assert len(partidas) == 2 and all(p["rodada"] == 1 for p in partidas), partidas
    _, lido = call("GET", f"/tournaments/{tid}")
    assert lido["status"] == "EM_ANDAMENTO"
    step(7, "partidas geradas (2 na semifinal); campeonato EM_ANDAMENTO")
    step(8, f"partidas listadas: {[(p['id'], p['team_a_id'], p['team_b_id']) for p in partidas]}")

    call("PATCH", f"/matches/{partidas[0]['id']}", {"status": "EM_ANDAMENTO"})
    call("POST", f"/matches/{partidas[0]['id']}/result", {"score_a": 1, "score_b": 1, "finalizar": True}, expect=(422,))
    for p in partidas:
        _, r = call("POST", f"/matches/{p['id']}/result", {"score_a": 13, "score_b": 7, "finalizar": True})
        assert r["status"] == "FINALIZADO"
    step(9, "resultados registrados (empate no mata-mata -> 422)")

    call("POST", f"/tournaments/{tid}/next-round")
    _, partidas = call("GET", f"/matches?tournament_id={tid}")
    final = [p for p in partidas if p["rodada"] == 2]
    assert len(final) == 1, partidas
    call("POST", f"/matches/{final[0]['id']}/result", {"score_a": 3, "score_b": 2, "finalizar": True})
    _, lido = call("GET", f"/tournaments/{tid}")
    assert lido["status"] == "FINALIZADO", lido
    step(10, "próxima fase gerada, final jogada; campeonato FINALIZADO")

    call("DELETE", f"/tournaments/{tid}")
    for eid in equipes:
        call("DELETE", f"/teams/{eid}")
    step(11, "limpeza: campeonato e equipes removidos")
    print("\nOK - fluxo completo funcionando.")


if __name__ == "__main__":
    main()
