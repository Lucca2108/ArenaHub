# Como o painel do organizador funciona

Guia para estudar e apresentar o código. Tecnologias: **Next.js + TypeScript** (como definido pelo grupo).

---

## 1. O caminho de uma tela, do começo ao fim

No Next.js, **as pastas dentro de `src/app` são as rotas** (os endereços do site):

```text
src/app/
├── layout.tsx              → envolve TODAS as páginas (fontes, CSS, login, avisos)
├── page.tsx                → endereço "/"  (redireciona para /admin)
└── admin/
    ├── login/page.tsx      → /admin/login
    └── (painel)/           → pasta entre parênteses NÃO aparece na URL
        ├── layout.tsx      → exige login + mostra menu lateral e topo
        ├── page.tsx        → /admin               (Dashboard)
        ├── campeonatos/
        │   ├── page.tsx    → /admin/campeonatos
        │   └── [id]/page.tsx → /admin/campeonatos/3  ([id] = parte variável da URL)
        ├── equipes/page.tsx  → /admin/equipes
        └── partidas/page.tsx → /admin/partidas
```

Quando alguém abre `/admin/equipes`, o Next monta, de fora para dentro:

`app/layout.tsx` → `(painel)/layout.tsx` (confere o login e desenha o menu) → `equipes/page.tsx`

Toda página faz a mesma coisa:
1. Quando abre, chama `carregar()`, que busca os dados na `api`.
2. Guarda os dados com `setDados(...)`.
3. O React desenha a tela com esses dados.
4. Depois de uma ação (criar, excluir, registrar placar...), chama `carregar()` de novo para atualizar.

---

## 2. As pastas

| Pasta | O que tem |
| :--- | :--- |
| `app/` | As páginas (uma pasta por endereço). É onde fica a lógica de cada tela: buscar dados, abrir modais, chamar a API. |
| `components/ui/` | Peças visuais reutilizáveis: `Button`, `Modal`, `Field` (campo de formulário), `Badge`, `Tabs`, `TeamLogo`... |
| `components/matches/` | Card de partida, modal de placar e modal de agendamento. |
| `components/tournaments/` | Card, formulário, inscrição de equipes, chaveamento, tabela, anel de progresso. |
| `components/teams/` | Card e formulário de equipe. |
| `components/layout/` | Menu lateral, barra do topo, fundo animado e a proteção de login. |
| `context/` | Informações "globais": quem está logado (`AuthContext`) e os avisos do canto da tela (`ToastContext`). |
| `services/` | Comunicação com o backend (ver seção 5). |
| `utils/` | Funções simples: formatar datas, montar confrontos, calcular classificação. |
| `types.ts` | Os tipos do TypeScript (ver seção 3). |
| `styles/` | Todo o visual (CSS). |

---

## 3. TypeScript: o que muda em relação ao JavaScript

TypeScript é JavaScript **com tipos**. Os tipos dizem o formato de cada dado, e o editor avisa o erro antes de rodar.

Todos os tipos do sistema ficam em `src/types.ts`:

```ts
export interface Team {
  id: number
  nome: string
  tag: string
  jogadores: string[]     // lista de textos
  capitao_id?: number     // "?" = campo opcional
}

export type MatchStatus = 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO'   // "|" = um desses valores
```

Os componentes dizem quais **props** recebem:

```tsx
type TeamCardProps = {
  team: Team
  onEdit: () => void      // uma função sem parâmetros
}

export function TeamCard({ team, onEdit }: TeamCardProps) { ... }
```

E o `useState` pode dizer o tipo do valor:

```tsx
const [dados, setDados] = useState<Dados | null>(null)   // começa null, depois recebe os dados
```

O que o TypeScript já evitou: se alguém escrever `team.nomee` (errado) ou esquecer de passar uma prop obrigatória, o `npm run build` falha e mostra onde está o erro.

---

## 4. Conceitos de React usados

**Componente**: uma função que devolve o que aparece na tela (JSX).

**Props**: informações que o componente pai passa para o filho (`team`, `onEdit`, `onClose`...).

**useState**: guarda uma informação que, quando muda, faz a tela ser redesenhada.
```tsx
const [busca, setBusca] = useState('')
<input value={busca} onChange={(e) => setBusca(e.target.value)} />
```

**useEffect**: roda um código em um momento específico. Aqui é usado para:
- carregar os dados quando a tela abre (`useEffect(() => { carregar() }, [])`); o `[]` quer dizer "só uma vez";
- atualizar o relógio a cada segundo (`setInterval`).

**Renderização condicional**: mostrar algo só se uma condição for verdadeira.
```tsx
{formAberto && <TournamentForm ... />}   // o modal só existe quando formAberto é true
```

**Listas com `map`**: desenhar um card para cada item (sempre com `key`).
```tsx
{teams.map((team) => <TeamCard key={team.id} team={team} ... />)}
```

**Context**: várias telas acessam a mesma informação sem passar por props. `useAuth()` devolve o usuário logado e `useToast()` mostra avisos.

---

## 5. Coisas específicas do Next.js

| Recurso | Para que serve aqui |
| :--- | :--- |
| `'use client'` no topo do arquivo | Diz que o componente roda no navegador (tem cliques, estado, animações). Quase todas as telas do painel usam. |
| `Link` (`next/link`) | Link entre páginas sem recarregar o site. |
| `useRouter()` | Trocar de página pelo código: `router.push('/admin/equipes')`. |
| `usePathname()` | Saber o endereço atual (usado para destacar o item certo no menu). |
| `useParams()` | Ler a parte variável da URL (o `[id]` de `/admin/campeonatos/3`). |
| `useSearchParams()` | Ler o que vem depois do `?` na URL (ex.: `?novo=1` abre o formulário). |
| `layout.tsx` | Parte da tela que se repete em várias páginas (menu, topo). |
| `next.config.ts` | Repassa `/api/...` para o backend FastAPI. |

**Por que o login só é lido depois de a página abrir?** O Next monta a página primeiro no servidor, e no servidor não existe `localStorage`. Por isso o `AuthContext` lê a sessão dentro de um `useEffect` (que só roda no navegador) e usa `carregado` para saber quando já leu.

---

## 6. Modo demo × API real

As telas nunca falam direto com o servidor; elas usam só o objeto `api`:

```ts
await api.tournaments.create(dados)
```

O arquivo `services/api.ts` escolhe qual versão usar:

| Arquivo | Quando | O que faz |
| :--- | :--- | :--- |
| `mockApi.ts` | `NEXT_PUBLIC_DATA_MODE=mock` (padrão) | Simula o backend e salva no `localStorage`. Serve para apresentar sem o backend rodando. |
| `httpApi.ts` | `NEXT_PUBLIC_DATA_MODE=api` | Faz requisições HTTP (`fetch`) para o FastAPI do grupo. |

As duas seguem a mesma **interface `Api`** (em `types.ts`). Se uma delas esquecer alguma função, o TypeScript acusa o erro.

---

## 7. Exemplo completo: registrar o placar de uma partida

1. Em `app/admin/(painel)/partidas/page.tsx`, o card da partida ao vivo tem o botão **Placar**.
2. Clicar nele chama `setPartidaPlacar(partida)`; o estado deixa de ser `null`.
3. Por causa de `{partidaPlacar && <ScoreModal ... />}`, o modal aparece.
4. No `ScoreModal.tsx`, os botões `+` e `−` mudam `placarA` e `placarB` (`useState`).
5. **Finalizar partida** chama `salvar(true)`:
   - se for mata-mata e estiver empatado, mostra um erro e para;
   - senão, chama `api.matches.saveResult(...)`.
6. Deu certo: mostra o aviso "Vitória de ...!", chama `onSaved()` (que é o `carregar()` da página) e `onClose()` (que volta o estado para `null` e fecha o modal).
7. A página busca os dados de novo e o card aparece como **Finalizada**.

---

## 8. Perguntas que o professor pode fazer

**Por que Next.js?**
É o framework React mais usado. Ele organiza as rotas por pastas (fica fácil achar cada tela) e já vem com TypeScript, otimização de build e um jeito simples de conectar com o backend.

**Por que TypeScript?**
Os tipos evitam erros bobos: campo com nome errado, esquecer uma informação, mandar texto onde era número. O erro aparece no editor, antes de rodar.

**O que é `'use client'`?**
No Next, os componentes rodam no servidor por padrão. Os que têm interação (clique, `useState`, animação) precisam rodar no navegador, e `'use client'` indica isso.

**O que é o `key` nas listas?**
É um identificador único de cada item. O React usa para saber qual item mudou, entrou ou saiu.

**Por que existe o `mockApi`?**
As rotas do backend ainda estão sendo feitas pelo Danilo e pelo Daniel. Com o mock o front pode ser desenvolvido e testado ao mesmo tempo. Quando o backend ficar pronto, é só trocar a variável `NEXT_PUBLIC_DATA_MODE`.

**Como funciona o login?**
`AuthContext` chama `api.auth.login`. Se der certo, a sessão é salva no `localStorage` (para continuar logado ao recarregar). O `RequireAuth` manda para `/admin/login` quem não estiver logado.

**Como os confrontos são gerados?**
Em `utils/bracket.ts`:
- Pontos corridos usa o "método do círculo": um time fica parado e os outros giram, e assim todos se enfrentam uma vez.
- Mata-mata pareia os times de dois em dois; se sobrar um, ele avança direto ("bye").

A regra oficial fica no backend; no front é uma simulação para o modo demo.

**O que é `async`/`await`?**
Chamadas à API demoram. `await` espera a resposta antes de seguir, e o `try/catch` trata os erros (por exemplo, mostrar "E-mail já cadastrado").

**Como são feitas as animações?**
Com a biblioteca Framer Motion: `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>` anima do estado inicial até o final. Nas listas, cada item recebe `delay: indice * 0.05`, e por isso aparecem um depois do outro. Os efeitos de fundo (grade, brilho, partículas) são só CSS (`@keyframes`).
