export async function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  // Check if the deep link is the Clerk OAuth callback (e.g. mobile://oauth-native-callback)
  if (path && path.includes("oauth-native-callback")) {
    const urlParts = path.split("?");
    const queryString = urlParts[1] ? `?${urlParts[1]}` : "";
    const targetPath = `/oauth-native-callback${queryString}`;
    return targetPath;
  }

  return path;
}
