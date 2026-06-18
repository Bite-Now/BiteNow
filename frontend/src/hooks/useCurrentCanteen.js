import { useAuth } from './useAuth';

export function useCurrentCanteen() {
  const { currentUser, loading, isAuthenticated } = useAuth();

  if (loading) return { canteenId: null, isLoaded: false, isSignedIn: false };
  if (!isAuthenticated) return { canteenId: null, isLoaded: true, isSignedIn: false };

  // Extract canteen_id from database user record
  const canteenId = currentUser?.canteen_id || null;
  
  return { canteenId, isLoaded: true, isSignedIn: true };
}
