import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Filter, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const platformColors: Record<string, string> = {
  whatsapp: "bg-emerald-100 text-emerald-700 border-emerald-200",
  messenger: "bg-blue-100 text-blue-700 border-blue-200",
};

const directionIcons: Record<string, React.ElementType> = {
  inbound: ArrowDownLeft,
  outbound: ArrowUpRight,
};

export default function MessagesPage() {
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const { data, isLoading } = trpc.message.list.useQuery({
    platform: platformFilter !== "all" ? (platformFilter as any) : undefined,
    limit: 50,
    offset: 0,
  });

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500 mt-1">WhatsApp and Messenger conversations</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="messenger">Messenger</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading messages...</div>
            ) : data?.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No messages found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Direction</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Platform</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">From</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">To</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Message</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((msg) => {
                      const DirectionIcon = directionIcons[msg.direction] || MessageSquare;
                      const isInbound = msg.direction === "inbound";
                      return (
                        <tr key={msg.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className={`flex items-center gap-2 ${isInbound ? "text-emerald-600" : "text-blue-600"}`}>
                              <DirectionIcon className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium capitalize">{msg.direction}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${platformColors[msg.platform] || ""}`}>
                              {msg.platform}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{msg.fromNumber || "-"}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{msg.toNumber || "-"}</td>
                          <td className="px-4 py-3">
                            <p className="text-slate-700 max-w-xs truncate">{msg.body}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs capitalize">
                              {msg.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
