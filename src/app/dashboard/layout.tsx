import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderAvailabilityStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { BundlePortalShell } from "@/components/bundle-portal-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const availability = await getOrderAvailabilityStatus();

  const [maintenanceModeSetting, siteAnnouncementSetting, popupSettings] = await Promise.all([
    prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode_enabled" },
    }),
    prisma.systemSetting.findUnique({
      where: { key: "site_announcement" },
    }),
    prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "popup_announcement_enabled",
            "popup_announcement_title",
            "popup_announcement_message",
            "popup_announcement_max_views",
            "popup_announcement_id",
            "popup_announcement_updated_at",
          ],
        },
      },
    }),
  ]);

  if (maintenanceModeSetting?.value === "true" && user.role !== "ADMIN") {
    redirect("/maintenance");
  }

  const announcement = siteAnnouncementSetting?.value?.trim() || null;
  const popupMap: Record<string, string> = {};
  for (const row of popupSettings) popupMap[row.key] = row.value;
  const popupAnnouncement =
    popupMap.popup_announcement_enabled === "true" && popupMap.popup_announcement_message?.trim()
      ? {
          id: popupMap.popup_announcement_id || "default",
          title: popupMap.popup_announcement_title?.trim() || "Delivery update",
          message: popupMap.popup_announcement_message.trim(),
          maxViews: Math.max(1, parseInt(popupMap.popup_announcement_max_views || "1", 10) || 1),
          updatedAt: popupMap.popup_announcement_updated_at || undefined,
        }
      : null;

  return (
    <BundlePortalShell
      user={user}
      announcement={announcement}
      offlineNotice={!availability.available ? availability.message : null}
      popupAnnouncement={popupAnnouncement}
    >
      {children}
    </BundlePortalShell>
  );
}
