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
import { Phone, PhoneCall, PhoneMissed, Voicemail, Clock, Filter, Headphones } from "lucide-react";

const statusColors: Record<string, string> = {
  initiated: "bg-slate-100 text-slate-600 border-slate-200",
  ringing: "bg-blue-100 text-blue-700 border-blue-200",
  answered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-teal-100 text-teal-700 border-teal-200",
  busy: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
  no_answer: "bg-orange-100 text-orange-700 border-orange-200",
  voicemail: "bg-violet-100 text-violet-700 border-violet-200",
};

const statusIcons: Record<string, React.ElementType> = {
  initiated: Phone,
  ringing: PhoneCall,
  answered: PhoneCall,
  completed: PhoneCall,
  busy: PhoneMissed,
  failed: PhoneMissed,
  no_answer: PhoneMissed,
  voicemail: Voicemail,
};

export default function CallsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = trpc.calls.list.useQuery({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    limit: 50,
    offset: 0,
  });

  const { data: stats } = trpc.calls.stats.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Calls</h1>
            <p className="text-sm text-slate-500 mt-1">Phone call logs and routing history</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-500 p-2">
                  <Headphones className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-slate-800">{stats?.total ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500 p-2">
                  <PhoneCall className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Answered</p>
                  <p className="text-xl font-bold text-slate-800">{stats?.answered ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-500 p-2">
                  <PhoneMissed className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Missed</p>
                  <p className="text-xl font-bold text-slate-800">{stats?.missed ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500 p-2">
                  <Voicemail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Voicemail</p>
                  <p className="text-xl font-bold text-slate-800">{stats?.voicemail ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="ringing">Ringing</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calls Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading calls...</div>
            ) : data?.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No calls found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-left font-medium text-slate-600">From</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">To</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Duration</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Menu</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((call) => {
                      const StatusIcon = statusIcons[call.status] || Phone;
                      return (
                        <tr key={call.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{call.fromNumber || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{call.toNumber || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-3.5 w-3.5 text-slate-400" />
                              <Badge variant="outline" className={`text-xs ${statusColors[call.status] || ""}`}>
                                {call.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {call.duration ? `${call.duration}s` : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-600">{call.menuChoice || "-"}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {call.createdAt ? new Date(call.createdAt).toLocaleString() : "-"}
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