import { useAuth } from "../../../context/AuthContext";

/**
 * Thin re-export so components inside features/authentication import from
 * their own feature folder rather than reaching into global context directly.
 */
export function useAuthentication() {
  return useAuth();
}
