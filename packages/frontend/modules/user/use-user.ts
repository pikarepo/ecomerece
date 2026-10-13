import {
  type BanUserDTO,
  BanUserDTOSchema,
  type BlockUserDTO,
  BlockUserDTOSchema,
  type DeleteMeDTO,
  DeleteMeDTOSchema,
  type DeleteUserDTO,
  DeleteUserDTOSchema,
  type ExtendBanDTO,
  ExtendBanDTOSchema,
  type GetAdminPaginatedUsersQueryDto,
  type GetPaginatedUsersQueryDto,
  getAdminPaginatedUsersQuerySchema,
  getPaginatedUsersQuerySchema,
  type UserResponseReadModel,
  type UserRoleDto,
  UserRoleDtoSchema,
  type UserRolesType,
} from '@ecomerece/shared';
import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type UserMutationResult, userService } from './user.service';

export const USER_QUERY_KEY = ['users'];

// ── Queries ─────────────────────────────────────────────────────────────────

export function useGetMe() {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'me'],
    queryFn: () => userService.getMe(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserById(userId: string) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, userId],
    queryFn: () => userService.getUserById(userId),
    enabled: Boolean(userId),
  });
}

export function useGetPaginatedUsers(params: GetPaginatedUsersQueryDto) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'paginated', params],
    queryFn: () => userService.getPaginatedUsers(getPaginatedUsersQuerySchema.parse(params)),
  });
}

export function useGetAdminPaginatedUsers(params: GetAdminPaginatedUsersQueryDto) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      userService.getAdminPaginatedUsers(getAdminPaginatedUsersQuerySchema.parse(params)),
  });
}

export interface AdminUsersInfiniteFilters {
  search?: string;
  role?: UserRolesType;
  deleted?: boolean;
  blocked?: boolean;
  banned?: boolean;
  limit?: number;
}

/** Infinite-scroll feed for the admin users page. Cursor-based (`nextCursor`). */
export function useGetAdminUsersInfinite(filters: AdminUsersInfiniteFilters = {}) {
  const { limit = 30, ...rest } = filters;
  return useInfiniteQuery({
    queryKey: [...USER_QUERY_KEY, 'admin-infinite', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      userService.getAdminPaginatedUsers({
        ...rest,
        limit,
        cursor: pageParam,
        direction: 'next',
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });
}

function applyUserMutationResult(queryClient: QueryClient, result: UserMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...USER_QUERY_KEY, updated.id], updated);
  queryClient.setQueryData<UserResponseReadModel | undefined>([...USER_QUERY_KEY, 'me'], (old) =>
    old && old.id === updated.id ? updated : old,
  );
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserRoleDto) => userService.assignRole(UserRoleDtoSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useSoftDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteUserDTO) =>
      userService.softDeleteUser(DeleteUserDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useSoftDeleteMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteMeDTO) => userService.softDeleteMe(DeleteMeDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useRecoverUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.recoverUser(userId),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlockUserDTO) => userService.blockUser(BlockUserDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useBlockLift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.blockLift(userId),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BanUserDTO) => userService.banUser(BanUserDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useBanLift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.banLift(userId),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useExtendBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtendBanDTO) => userService.extendBan(ExtendBanDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}

export function useShortenBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtendBanDTO) => userService.shortenBan(ExtendBanDTOSchema.parse(data)),
    onSuccess: (data) => applyUserMutationResult(queryClient, data),
  });
}
