import { useUser } from "@clerk/clerk-react";

export function useCurrentCanteen() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return { canteenId: null, isLoaded, isSignedIn };
  if (!isSignedIn) return { canteenId: null, isLoaded, isSignedIn };

  // Extract canteen_id from public metadata
  const canteenId = user?.publicMetadata?.canteen_id || null;
  
  return { canteenId, isLoaded, isSignedIn };
}
