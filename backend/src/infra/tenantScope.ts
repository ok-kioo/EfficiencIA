import { HttpError } from "./errors.js";

/**
 * Reforço de RLS no nível da aplicação.
 *
 * Garante que toda operação sobre recursos com `user_id` seja escopada
 * pelo usuário autenticado. Use quando montar repositórios novos.
 *
 * Padrão recomendado:
 *
 *   const scoped = withTenantScope(req.user!.id);
 *   const project = await scoped(projectRepo.findById)(projectId);
 *   // → o repo recebe { id, userId } e a query filtra por user_id.
 */
export type Scoped<TFn> = TFn extends (
  args: infer A,
  ...rest: infer R
) => infer Ret
  ? (args: Omit<A, "userId">, ...rest: R) => Ret
  : never;

export function withTenantScope(userId: string) {
  if (!userId) throw new HttpError(401, "Sessão expirada.", "unauthenticated");
  return function bind<TFn extends (args: { userId: string } & Record<string, unknown>, ...rest: unknown[]) => unknown>(
    fn: TFn,
  ): Scoped<TFn> {
    return ((args: Record<string, unknown>, ...rest: unknown[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fn as any)({ ...args, userId }, ...rest)) as Scoped<TFn>;
  };
}

/**
 * Asserção defensiva para qualquer recurso que carregue `user_id`.
 * Use quando um repo retornar um registro: confirma que pertence ao tenant.
 */
export function assertOwnership(
  resource: { user_id?: string } | null | undefined,
  userId: string,
  notFoundMessage = "Recurso não encontrado.",
): asserts resource is { user_id: string } {
  if (!resource || resource.user_id !== userId) {
    throw new HttpError(404, notFoundMessage);
  }
}
