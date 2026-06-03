// Simple in-memory token store.
// TODO: replace with expo-secure-store for persistence across restarts.

let _token: string | null = null

export const tokenStore = {
  get: () => _token,
  set: (t: string | null) => { _token = t },
  clear: () => { _token = null },
}
