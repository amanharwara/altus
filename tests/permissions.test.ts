import { expect, it } from "vitest";
import { isPartitionPermissionGranted } from "../src/permissions";

it.each(["media", "display-capture"])(
  "%s follows only the requesting account's media grant",
  (permission) => {
    const grants = { notifications: new Set(["other"]), media: new Set(["account"]) };
    expect(isPartitionPermissionGranted(grants, "account", permission)).toBe(true);
    expect(isPartitionPermissionGranted(grants, "other", permission)).toBe(false);
    grants.media.delete("account");
    expect(isPartitionPermissionGranted(grants, "account", permission)).toBe(false);
  }
);

it("keeps notification grants independent and rejects unhandled permissions", () => {
  const grants = { notifications: new Set(["account"]), media: new Set(["other"]) };
  expect(isPartitionPermissionGranted(grants, "account", "notifications")).toBe(true);
  expect(isPartitionPermissionGranted(grants, "other", "notifications")).toBe(false);
  for (const permission of ["geolocation", "clipboard-read", "unknown"]) {
    expect(isPartitionPermissionGranted(grants, "account", permission)).toBe(false);
  }
});
