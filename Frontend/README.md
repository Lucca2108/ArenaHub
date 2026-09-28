# 🎮 ArenaHub · Frontend (Painel do Organizador)

Telas do **organizador**: login, dashboard, cadastro de campeonatos, equipes e gerenciamento de partidas.
Feito em **React + Vite**, com **Framer Motion** para as animações e **lucide-react** para os ícones.

> Responsável: Cauã (front-end administrativo e apoio na integração)

---

## ▶️ Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo. Rode um comando por linha (o PowerShell do Windows não aceita `&&`):

```powershell
cd Frontend
npm install
npm run dev
```

Abra http://localhost:5173 (redireciona para `/admin`).

> 📘 Para entender o código, leia o [COMO_FUNCIONA.md](COMO_FUNCIONA.md).

**Login demo:** `organizador@arenahub.gg` / `arena123` (tem um botão "Preencher" na tela de login).

### Modos de dados

O painel funciona em dois modos, controlados por `VITE_DATA_MODE` (copie `.env.example` para `.env`):

| Modo | O que faz |
| :--- | :--- |
| `mock` (padrão) | Usa um "backend de mentira" no `localStorage`, com campeonatos, equipes e partidas de exemplo. Não precisa do backend rodando. O botão **Restaurar dados demo** na sidebar volta ao estado inicial. |
| `api` | Chama o FastAPI de verdade. O Vite repassa tudo que começa com `/api` para `VITE_API_TARGET` (padrão `http://localhost:8000`), então **não precisa configurar CORS** em desenvolvimento. |

As telas só importam `api` de `src/services/api.js`; trocar de modo não muda nenhuma tela.

---

## 🗺️ Telas (rotas)

| Rota | Tela |
| :--- | :--- |
| `/admin/login` | Login e cadastro de organizador |
| `/admin` | Dashboard: indicadores, partidas ao vivo, próximas partidas, campeonatos |
| `/admin/campeonatos` | Lista com filtros por status e busca; criar, editar e excluir |
| `/admin/campeonatos/:id` | Detalhes: inscrever/remover equipes, gerar partidas, próxima fase, chaveamento, prévia da classificação, campeão |
| `/admin/equipes` | Equipes com elenco, capitão, tag e cor do escudo |
| `/admin/partidas` | Todas as partidas: agendar horário, iniciar, registrar placar (parcial ou final) |

---

## 📂 Estrutura

```text
src/
├── components/
│   ├── layout/        # Sidebar, Topbar, fundo animado, proteção de rota
│   ├── ui/            # Botão, Modal, Campo, Badge, Abas, Escudo da equipe...
│   ├── matches/       # Card de partida, modal de placar e de agendamento
│   ├── tournaments/   # Card, formulário, inscrição de equipes, chaveamento
│   └── teams/         # Card e formulário de equipe
├── context/           # Autenticação e notificações (toasts)
├── pages/admin/       # Uma página por rota
├── services/
│   ├── api.js         # Escolhe mock ou http
│   ├── httpApi.js     # Chamadas reais ao FastAPI
│   └── mockApi.js     # Backend simulado (localStorage)
├── styles/            # base (tokens/animações), layout, components, pages
└── utils/             # Constantes, formatação de datas, chaveamento
```

**Vitor:** as telas públicas podem entrar no mesmo app. Hoje `/` só redireciona para `/admin` (ver `App.jsx`).
Dá para reaproveitar `TeamLogo`, `MatchCard` (sem as props `onSchedule`/`onStart`/`onResult` ele fica só de leitura), `Badge`, `Tabs`, o `Background` e os estilos.

---

## 🔌 Rotas que o painel usa (contrato com o backend)

**Danilo / Daniel:** esta é a lista do que o painel chama no modo `api`. As marcadas com ✅ já existem no `main.py`.
Erros devem vir no padrão do FastAPI (`{"detail": "mensagem"}`); a mensagem aparece para o usuário.
O token (quando existir) vai em `Authorization: Bearer <token>`.

### Autenticação

| Método | Rota | Corpo | Resposta | |
| :--- | :--- | :--- | :--- | :---: |
| POST | `/users` | `{nome, email, senha, role: "organizador"}` | `UserResponse` | ✅ |
| POST | `/auth/login` | `{email, senha}` | `{access_token, user: {id, nome, email, role}}` | ⏳ |

### Campeonatos

| Método | Rota | Corpo / Parâmetros | Resposta | |
| :--- | :--- | :--- | :--- | :---: |
| GET | `/tournaments` | – | lista de campeonatos | ✅ |
| POST | `/tournaments` | campos do campeonato + `organizador_id` | campeonato | ✅ |
| GET | `/tournaments/{id}` | – | campeonato | ⏳ |
| PUT | `/tournaments/{id}` | campos editáveis (inclui `status`) | campeonato | ⏳ |
| DELETE | `/tournaments/{id}` | – | 204 | ⏳ |
| POST | `/tournaments/{id}/teams` | `{team_id}` | campeonato | ⏳ |
| DELETE | `/tournaments/{id}/teams/{team_id}` | – | 204 | ⏳ |
| POST | `/tournaments/{id}/generate-matches` | – | lista de partidas | ⏳ |
| POST | `/tournaments/{id}/next-round` | – (só eliminatória) | lista de partidas | ⏳ |

### Equipes

| Método | Rota | Corpo | Resposta | |
| :--- | :--- | :--- | :--- | :---: |
| GET | `/teams` | – | lista de equipes | ⏳ |
| POST | `/teams` | campos da equipe + `capitao_id` | equipe | ✅ |
| PUT | `/teams/{id}` | campos editáveis | equipe | ⏳ |
| DELETE | `/teams/{id}` | – | 204 (409 se já jogou partidas) | ⏳ |

### Partidas

| Método | Rota | Corpo / Parâmetros | Resposta | |
| :--- | :--- | :--- | :--- | :---: |
| GET | `/matches` | `?tournament_id=` (opcional) | lista de partidas | ⏳ |
| PATCH | `/matches/{id}` | `{data_hora}` ou `{status: "EM_ANDAMENTO"}` | partida | ⏳ |
| POST | `/matches/{id}/result` | `{score_a, score_b, finalizar}` | partida | ⏳ |

`finalizar: false` salva placar parcial e deixa a partida `EM_ANDAMENTO`; `true` muda para `FINALIZADO` e deve disparar a atualização da classificação.

### Regras que o painel espera do backend

As mesmas regras estão simuladas em `src/services/mockApi.js`, que pode servir de referência:

- Gerar partidas encerra as inscrições e muda o status do campeonato para `EM_ANDAMENTO`.
- Pontos corridos: todos contra todos. Eliminatória: sorteio da 1ª fase; com número ímpar, um time avança direto (partida com `team_b_id = null`, já `FINALIZADO`).
- No mata-mata não pode finalizar partida empatada.
- Depois que a próxima fase é gerada, os resultados da fase anterior não podem mais mudar.
- O campeonato vira `FINALIZADO` sozinho quando a última partida (ou a final) termina.

---

## 🗃️ Campos usados pelas telas (Lucca)

Os nomes seguem o `models.py`. Os campos marcados com ➕ ainda não existem no banco. Até eles existirem, o `httpApi.js` preenche valores padrão para as telas não quebrarem.

**Tournament:** `id`, `nome`, `descricao`, `organizador_id`, ➕`jogo` (texto), ➕`formato` (`pontos_corridos` \| `eliminatoria`), ➕`status` (`INSCRICOES_ABERTAS` \| `EM_ANDAMENTO` \| `FINALIZADO`), ➕`data_inicio`, ➕`data_fim`, ➕`max_equipes`, ➕`premiacao`, ➕`team_ids` (lista de ids das equipes inscritas; sugestão: tabela `tournament_teams`).

**Team:** `id`, `nome`, `capitao_id`, ➕`tag` (até 4 letras), ➕`cor` (hex, ex.: `#00f0ff`), ➕`capitao` (nick), ➕`jogadores` (lista de nicks).

**Match:** `id`, `tournament_id`, `team_a_id`, `team_b_id`, `score_a`, `score_b`, `status` (`AGENDADO` \| `EM_ANDAMENTO` \| `FINALIZADO`), `data_hora`, ➕`rodada` (inteiro, 1, 2, 3…).
