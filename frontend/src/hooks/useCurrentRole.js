import { useUser } from "@clerk/clerk-react";

export function useCurrentRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return { role: null, isLoaded, isSignedIn };
  if (!isSignedIn) return { role: null, isLoaded, isSignedIn };

  // Extract role from public metadata, default to STUDENT
  const role = user?.publicMetadata?.role || "STUDENT";
  
  return { role, isLoaded, isSignedIn };
}
