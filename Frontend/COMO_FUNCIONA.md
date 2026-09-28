# Como o painel do organizador funciona

Guia para estudar e apresentar o código.

---

## 1. O caminho de uma tela, do começo ao fim

```text
index.html
  └─ src/main.jsx          → carrega as fontes, os estilos e o <App />
      └─ src/App.jsx       → define as ROTAS (qual URL mostra qual página)
          ├─ /admin/login  → pages/admin/Login.jsx
          └─ /admin/...    → RequireAuth (precisa estar logado)
                               └─ AdminLayout (fundo + menu + topo)
                                    └─ <Outlet />  ← aqui entra a página da rota
                                         ├─ Dashboard.jsx
                                         ├─ Tournaments.jsx
                                         ├─ TournamentDetail.jsx
                                         ├─ Teams.jsx
                                         └─ Matches.jsx
```

Toda página faz a mesma coisa:
1. Quando abre, chama `carregar()`, que busca os dados na `api`.
2. Guarda os dados com `setDados(...)`.
3. O React desenha a tela com esses dados.
4. Depois de uma ação (criar, excluir, registrar placar...), chama `carregar()` de novo para atualizar.

---

## 2. As pastas

| Pasta | O que tem |
| :--- | :--- |
| `pages/admin/` | Uma página por tela. É onde fica a lógica: buscar dados, abrir modais, chamar a API. |
| `components/ui/` | Peças visuais reutilizáveis: `Button`, `Modal`, `Field` (campo de formulário), `Badge`, `Tabs`, `TeamLogo`... |
| `components/matches/` | Card de partida, modal de placar e modal de agendamento. |
| `components/tournaments/` | Card, formulário, inscrição de equipes, chaveamento, tabela, anel de progresso. |
| `components/teams/` | Card e formulário de equipe. |
| `components/layout/` | Menu lateral, barra do topo, fundo animado e a proteção de login. |
| `context/` | Informações "globais": quem está logado (`AuthContext`) e os avisos do canto da tela (`ToastContext`). |
| `services/` | Comunicação com o backend (ver seção 4). |
| `utils/` | Funções simples: formatar datas, montar confrontos, calcular classificação. |
| `styles/` | Todo o visual (CSS). |

---

## 3. Conceitos de React usados

Só foram usados os conceitos básicos:

**Componente**: uma função que devolve o que aparece na tela (JSX).
```jsx
function TeamCard({ team }) {
  return <h3>{team.nome}</h3>
}
```

**Props**: informações que o componente pai passa para o filho (`team`, `onEdit`, `onClose`...).

**useState**: guarda uma informação que, quando muda, faz a tela ser redesenhada.
```jsx
const [busca, setBusca] = useState('')
<input value={busca} onChange={(e) => setBusca(e.target.value)} />
```

**useEffect**: roda um código em um momento específico. Aqui é usado para:
- carregar os dados quando a tela abre (`useEffect(() => { carregar() }, [])`); o `[]` quer dizer "só uma vez";
- atualizar o relógio a cada segundo (`setInterval`).

**Renderização condicional**: mostrar algo só se uma condição for verdadeira.
```jsx
{formAberto && <TournamentForm ... />}   // o modal só existe quando formAberto é true
```

**Listas com `map`**: desenhar um card para cada item da lista (sempre com `key`).
```jsx
{teams.map((team) => <TeamCard key={team.id} team={team} />)}
```

**Context**: um jeito de várias telas acessarem a mesma informação sem passar por props. `useAuth()` devolve o usuário logado e `useToast()` mostra avisos.

**React Router**: troca de página sem recarregar o site (`<Link>`, `useNavigate`, `useParams` para pegar o `:id` da URL).

---

## 4. Modo demo × API real

As telas nunca falam direto com o servidor. Elas usam só o objeto `api`:

```js
await api.tournaments.create(dados)
```

O arquivo `services/api.js` escolhe qual versão usar:

| Arquivo | Quando | O que faz |
| :--- | :--- | :--- |
| `mockApi.js` | `VITE_DATA_MODE=mock` (padrão) | Simula o backend e salva no `localStorage` do navegador. Serve para apresentar sem o backend rodando. |
| `httpApi.js` | `VITE_DATA_MODE=api` | Faz requisições HTTP (`fetch`) para o FastAPI do grupo. |

Os dois têm as **mesmas funções**, então trocar de um para o outro não muda nenhuma tela.

---

## 5. Exemplo completo: registrar o placar de uma partida

1. Em `Matches.jsx`, o card da partida ao vivo tem o botão **Placar**.
2. Clicar nele chama `setPartidaPlacar(partida)`; o estado deixa de ser `null`.
3. Por causa de `{partidaPlacar && <ScoreModal ... />}`, o modal aparece.
4. No `ScoreModal.jsx`, os botões `+` e `−` mudam `placarA` e `placarB` (`useState`).
5. **Finalizar partida** chama `salvar(true)`:
   - se for mata-mata e estiver empatado, mostra um erro e para;
   - senão, chama `api.matches.saveResult(...)`.
6. Deu certo: mostra o aviso "Vitória de ...!", chama `onSaved()` (que é o `carregar()` da página) e `onClose()` (que volta o estado para `null` e fecha o modal).
7. A página busca os dados de novo e o card aparece como **Finalizada**.

---

## 6. Perguntas que o professor pode fazer

**Por que React?**
Porque a tela muda o tempo todo (placar, listas, filtros). Com React você só muda o estado e ele redesenha a tela sozinho.

**O que é o `key` nas listas?**
É um identificador único de cada item. O React usa para saber qual item mudou, entrou ou saiu.

**Por que existe o `mockApi`?**
As rotas do backend ainda estão sendo feitas pelo Danilo e pelo Daniel. Com o mock o front pode ser desenvolvido e testado ao mesmo tempo. Quando o backend ficar pronto, é só trocar a variável `VITE_DATA_MODE`.

**Como funciona o login?**
`AuthContext` chama `api.auth.login`. Se der certo, a sessão é salva no `localStorage` (para continuar logado ao recarregar). O `RequireAuth` manda para `/admin/login` quem não estiver logado.

**Como os confrontos são gerados?**
Em `utils/bracket.js`:
- Pontos corridos usa o "método do círculo": um time fica parado e os outros giram, e assim todos se enfrentam uma vez.
- Mata-mata pareia os times de dois em dois; se sobrar um, ele avança direto ("bye").

A regra oficial fica no backend; no front é uma simulação para o modo demo.

**O que é `async`/`await`?**
Chamadas à API demoram. `await` espera a resposta chegar antes de seguir para a próxima linha, e o `try/catch` trata os erros (por exemplo, mostrar "E-mail já cadastrado").

**Como são feitas as animações?**
Com a biblioteca Framer Motion: `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>` anima do estado inicial até o final. Nas listas, cada item recebe `delay: indice * 0.05`, e por isso eles aparecem um depois do outro. Os efeitos de fundo (grade, brilho, partículas) são só CSS (`@keyframes`).

**Por que o modal usa `createPortal`?**
Para ser desenhado direto no `<body>`, por cima de tudo, sem ficar preso dentro do layout da página.
