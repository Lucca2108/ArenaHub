// Funções para mostrar datas e textos no formato brasileiro

// Coloca zero à esquerda: 7 -> "07"
export function doisDigitos(numero: number): string {
  return numero < 10 ? `0${numero}` : `${numero}`
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// "2026-10-04T19:00:00Z" -> "04/10/2026"
export function formatDate(valor: string | null): string {
  if (!valor) return '—'
  const d = new Date(valor)
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`
}

// -> "Sáb, 04 out · 19:00"
export function formatDateTime(valor: string | Date | null): string {
  if (!valor) return 'A definir'
  const d = new Date(valor)
  const dia = `${DIAS_SEMANA[d.getDay()]}, ${doisDigitos(d.getDate())} ${MESES[d.getMonth()]}`
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
  return `${dia} · ${hora}`
}

// Distância até agora: "em 2 h", "há 15 min", "em 5 d"
export function formatRelative(valor: string | null): string {
  if (!valor) return ''
  const minutos = Math.round((new Date(valor).getTime() - Date.now()) / 60000)
  const distancia = Math.abs(minutos)

  let texto: string
  if (distancia < 1) return 'agora'
  if (distancia < 60) texto = `${distancia} min`
  else if (distancia < 60 * 24) texto = `${Math.round(distancia / 60)} h`
  else texto = `${Math.round(distancia / (60 * 24))} d`

  return minutos > 0 ? `em ${texto}` : `há ${texto}`
}

// O <input type="datetime-local"> usa o formato "2026-10-04T19:00"
export function toInputDateTime(valor: string | null): string {
  if (!valor) return ''
  const d = new Date(valor)
  const data = `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
  return `${data}T${hora}`
}

// O <input type="date"> usa só a parte da data: "2026-10-04"
export function toInputDate(valor: string | null): string {
  return toInputDateTime(valor).slice(0, 10)
}

// Converte o valor do input de volta para o formato que vai para a API
export function fromInputDateTime(valor: string): string | null {
  if (!valor) return null
  return new Date(valor).toISOString()
}

// Gera a sigla da equipe: "Nexus Wolves" -> "NW", "Titans" -> "TIT"
export function makeTag(nome: string): string {
  const palavras = nome.trim().split(' ').filter((palavra) => palavra !== '')
  if (palavras.length === 0) return ''
  if (palavras.length === 1) return palavras[0].slice(0, 3).toUpperCase()

  let sigla = ''
  for (const palavra of palavras) sigla += palavra[0]
  return sigla.slice(0, 4).toUpperCase()
}

// plural(1, 'partida') -> "1 partida" | plural(3, 'partida') -> "3 partidas"
export function plural(quantidade: number, palavra: string): string {
  return quantidade === 1 ? `${quantidade} ${palavra}` : `${quantidade} ${palavra}s`
}
