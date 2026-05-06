import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck2,
  Languages,
  MessageCircle,
  MessagesSquare,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";

type DashboardLanguage = "en" | "ar";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-[#eadfce] bg-white/85 shadow-[0_12px_28px_-22px_rgba(101,79,54,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-26px_rgba(101,79,54,0.45)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9d8365]">{title}</p>
            <h3 className="mt-1 text-2xl font-bold text-[#5d4630]">{value}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[#9f8a73]">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-2.5 shadow-sm ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [language, setLanguage] = useState<DashboardLanguage>("en");
  const { data: summary } = trpc.lead.dashboardSummary.useQuery();
  const { data: recentMessages } = trpc.message.list.useQuery({ limit: 6, offset: 0 });
  const { data: settings } = trpc.setting.list.useQuery();

  const copy = useMemo(() => {
    if (language === "ar") {
      return {
        heroTitle: "لوحة متابعة الضيافة",
        heroSubtitle: "متابعة الاستفسارات والمحادثات وإدارة الحجوزات في لا فيدا ريزورت.",
        totalInquiries: "إجمالي الاستفسارات",
        whatsappInquiries: "استفسارات واتساب",
        messengerInquiries: "استفسارات ماسنجر",
        bookingRequests: "طلبات الحجز",
        recentConversations: "آخر المحادثات",
        quickReplies: "قوالب الرد السريع",
        languageCoverage: "تغطية اللغات",
        arabic: "العربية",
        english: "الإنجليزية",
        noConversations: "لا توجد محادثات حديثة.",
        noTemplates: "لا توجد قوالب رد محفوظة في الإعدادات.",
      };
    }

    return {
      heroTitle: "Guest Experience Dashboard",
      heroSubtitle: "Track resort inquiries, conversations, and booking intent across channels.",
      totalInquiries: "Total Inquiries",
      whatsappInquiries: "WhatsApp Inquiries",
      messengerInquiries: "Messenger Inquiries",
      bookingRequests: "Booking Requests",
      recentConversations: "Recent Conversations",
      quickReplies: "Quick Reply Templates",
      languageCoverage: "Language Coverage",
      arabic: "Arabic",
      english: "English",
      noConversations: "No recent conversations yet.",
      noTemplates: "No quick reply templates found in settings.",
    };
  }, [language]);

  const quickReplyTemplates = useMemo(
    () =>
      (settings ?? []).filter(
        (item) =>
          item.key.toLowerCase().includes("quick_reply") ||
          item.key.toLowerCase().includes("template")
      ),
    [settings]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#ebdecb] bg-gradient-to-r from-[#f6ecde] via-[#f8f1e7] to-[#f4ece0] p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9a7f61]">La Vida Resort & Beach Club</p>
              <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold text-[#5a422a]">
                <Waves className="h-6 w-6 text-[#8f6b46]" />
                {copy.heroTitle}
              </h1>
              <p className="mt-1 text-sm text-[#8f7a63]">{copy.heroSubtitle}</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-[#e8dac7] bg-white/80 p-1">
              <Button
                variant={language === "en" ? "default" : "ghost"}
                onClick={() => setLanguage("en")}
                className="h-8 rounded-lg"
              >
                EN
              </Button>
              <Button
                variant={language === "ar" ? "default" : "ghost"}
                onClick={() => setLanguage("ar")}
                className="h-8 rounded-lg"
              >
                AR
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={copy.totalInquiries}
            value={summary?.totalInquiries ?? 0}
            subtitle="All channels"
            icon={Users}
            color="bg-gradient-to-br from-[#cfa472] to-[#b68753]"
          />
          <StatCard
            title={copy.whatsappInquiries}
            value={summary?.whatsappInquiries ?? 0}
            subtitle="WhatsApp"
            icon={MessageCircle}
            color="bg-gradient-to-br from-[#d9ad66] to-[#c79348]"
          />
          <StatCard
            title={copy.messengerInquiries}
            value={summary?.messengerInquiries ?? 0}
            subtitle="Messenger"
            icon={MessagesSquare}
            color="bg-gradient-to-br from-[#70a996] to-[#4c8a76]"
          />
          <StatCard
            title={copy.bookingRequests}
            value={summary?.bookingRequests ?? 0}
            subtitle="Booking intent"
            icon={CalendarCheck2}
            color="bg-gradient-to-br from-[#bb8775] to-[#9b6654]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-[#eadfce] bg-white/85 shadow-[0_12px_28px_-22px_rgba(101,79,54,0.45)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#6d5438]">{copy.recentConversations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages?.items.length ? (
                  recentMessages.items.map((msg) => (
                    <div key={msg.id} className="rounded-xl border border-[#eee4d5] bg-[#fffdf9] p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="border-[#e6d8c3] text-[#7b5f40]">
                          {msg.platform}
                        </Badge>
                        <span className="text-xs text-[#a79279]">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-[#6e563b]">{msg.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#9f8a73]">{copy.noConversations}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#eadfce] bg-white/85 shadow-[0_12px_28px_-22px_rgba(101,79,54,0.45)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#6d5438]">{copy.quickReplies}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickReplyTemplates.length ? (
                  quickReplyTemplates.slice(0, 6).map((template) => (
                    <div key={template.key} className="rounded-xl border border-[#eee4d5] bg-[#fffdf9] p-3">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#9a7e5f]">
                        <Sparkles className="h-3.5 w-3.5" />
                        {template.key}
                      </p>
                      <p className="line-clamp-2 text-sm text-[#6e563b]">{template.value || "-"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#9f8a73]">{copy.noTemplates}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#eadfce] bg-white/85 shadow-[0_12px_28px_-22px_rgba(101,79,54,0.45)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#6d5438]">
              <Languages className="h-4 w-4" />
              {copy.languageCoverage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5d4630]">{summary?.arabicInquiries ?? 0}</p>
                <p className="mt-1 text-xs text-[#9b866d]">{copy.arabic}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4f8b76]">{summary?.englishInquiries ?? 0}</p>
                <p className="mt-1 text-xs text-[#9b866d]">{copy.english}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
