/**
 * @deprecated This file has been moved to @/queries/authQueries
 * Please update your imports:
 * - import { useUser, useLogin, etc } from "@/queries/authQueries"
 * - Or import from "@/queries" for all queries
 */

export {
  authKeys,
  useUser,
  useSession,
  useIsAuthenticated,
  useLogin,
  useRegister,
  useLogout,
  usePasswordResetRequest,
  useUpdateProfile,
  useResendEmailVerification,
} from "@/queries/authQueries";