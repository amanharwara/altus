export type PermissionGrants = {
  notifications: ReadonlySet<string>;
  media: ReadonlySet<string>;
};

/** Keep screen capture subject to the account's existing media permission. */
export function isPartitionPermissionGranted(
  grants: PermissionGrants,
  partition: string,
  permission: string
): boolean {
  const category = permission === "display-capture" ? "media" : permission;
  if (category !== "notifications" && category !== "media") return false;
  return grants[category].has(partition);
}
