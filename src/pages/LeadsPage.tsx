import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, User, Mail, MessageCircle, Filter, Eye, Edit, Trash2, PhoneCall } from "lucide-react";
import type { RouterOutputs } from "@/providers/trpc";

type Lead = RouterOutputs["lead"]["list"]["items"][number];

const statusColors: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  qualified: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-slate-100 text-slate-600 border-slate-200",
};

const sourceIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  messenger: MessageCircle,
  phone: PhoneCall,
  email: Mail,
  walk_in: User,
  other: User,
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.lead.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    source: sourceFilter !== "all" ? (sourceFilter as any) : undefined,
    limit: 50,
    offset: 0,
  });

  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.stats.invalidate();
    },
  });

  const deleteLead = trpc.lead.delete.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.stats.invalidate();
      setDetailOpen(false);
    },
  });

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes ?? "");
    setDetailOpen(true);
  };

  const saveNotes = () => {
    if (!selectedLead) return;
    updateLead.mutate({ id: selectedLead.id, notes: editNotes });
  };

  const updateStatus = (status: string) => {
    if (!selectedLead) return;
    updateLead.mutate({ id: selectedLead.id, status: status as any });
    setSelectedLead({ ...selectedLead, status: status as any });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer inquiries and contacts</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, email..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading leads...</div>
            ) : data?.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Interest</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Assigned</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((lead) => {
                      const SourceIcon = sourceIcons[lead.source] || User;
                      return (
                        <tr
                          key={lead.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => openDetail(lead)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{lead.name || "Unknown"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-slate-600">{lead.phone || lead.email || "-"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <SourceIcon className="h-3.5 w-3.5 text-slate-400" />
                              <span className="capitalize text-slate-600">{lead.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-slate-600">{lead.interest.replace("_", " ")}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${statusColors[lead.status] || ""}`}>
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {lead.assignedTo?.name || "Unassigned"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetail(lead);
                              }}
                            >
                              <Eye className="h-4 w-4 text-slate-400" />
                            </Button>
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

      {/* Lead Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-slate-800">{selectedLead.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phone</p>
                  <p className="text-sm font-medium text-slate-800">{selectedLead.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-800">{selectedLead.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Source</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">{selectedLead.source}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Interest</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {selectedLead.interest.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Language</p>
                  <p className="text-sm font-medium text-slate-800 uppercase">{selectedLead.language}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["new", "contacted", "qualified", "completed", "lost"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedLead.status === s ? "default" : "outline"}
                      className={
                        selectedLead.status === s
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "text-slate-600"
                      }
                      onClick={() => updateStatus(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Notes</p>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={saveNotes}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Save Notes
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => selectedLead && deleteLead.mutate({ id: selectedLead.id })}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
