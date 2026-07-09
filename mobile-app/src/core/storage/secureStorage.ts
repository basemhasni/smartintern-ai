/**
 * SecureStore will be introduced with authentication in Step 2.
 * This contract keeps token persistence behind one module from day one.
 */
export const secureStorage = {
  async getToken(): Promise<string | null> {
    return null;
  },
  async setToken(_token: string): Promise<void> {
    // TODO Step 2: persist with expo-secure-store.
  },
  async clearToken(): Promise<void> {
    // TODO Step 2: clear the persisted mobile token.
  },
};
