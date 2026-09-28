// Erro com o código HTTP junto (ex.: 404, 409), para as telas mostrarem a mensagem certa
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// No TypeScript, o erro do "catch" pode ser qualquer coisa.
// Esta função pega a mensagem de um jeito seguro.
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return 'Erro inesperado.'
}
