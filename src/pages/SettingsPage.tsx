import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Key, MessageCircle, Phone, Bot, Building2, Save, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.setting.list.useQuery();

  const bulkUpsert = trpc.setting.bulkUpsert.useMutation({
    onSuccess: () => {
      utils.setting.list.invalidate();
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const getValue = (key: string, defaultValue = "") => {
    if (form[key] !== undefined) return form[key];
    const s = settings?.find((x) => x.key === key);
    return s?.value ?? defaultValue;
  };

  const setValue = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveSettings = (category: string, keys: string[]) => {
    const payload = keys.map((key) => ({
      key,
      value: getValue(key),
      category: category as any,
    }));
    bulkUpsert.mutate(payload, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure integrations and system preferences</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            Settings saved successfully
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-slate-100 border border-slate-200">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              Resort
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="twilio" className="gap-2">
              <Phone className="h-4 w-4" />
              Twilio
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Engine
            </TabsTrigger>
          </TabsList>

          {/* General / Resort */}
          <TabsContent value="general" className="mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-teal-600" />
                  Resort Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resort Name</Label>
                    <Input value="La Vida Resort & Beach Club" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value="Zuwarah, Libya" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={getValue("resort_phone", "+218 91 211 0392")}
                      onChange={(e) => setValue("resort_phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={getValue("resort_email", "info@lavida.ly")}
                      onChange={(e) => setValue("resort_email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("resort", ["resort_phone", "resort_email"])}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  WhatsApp Cloud API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
                  Configure your Meta WhatsApp Business API credentials here. These are managed via environment variables for security.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <Input value={getValue("whatsapp_phone_number_id", "")} disabled placeholder="Set in .env" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Account ID</Label>
                    <Input value={getValue("whatsapp_business_account_id", "")} disabled placeholder="Set in .env" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Version</Label>
                    <Input value={getValue("whatsapp_api_version", "v18.0")} onChange={(e) => setValue("whatsapp_api_version", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook Verify Token</Label>
                    <Input value={getValue("whatsapp_verify_token", "")} disabled placeholder="Set in .env" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("whatsapp", ["whatsapp_api_version"])}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twilio */}
          <TabsContent value="twilio" className="mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" />
                  Twilio Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
                  Twilio credentials are configured via environment variables for security.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Twilio Phone Number</Label>
                    <Input value={getValue("twilio_phone_number", "+218 91 211 0392")} onChange={(e) => setValue("twilio_phone_number", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner/Management Number</Label>
                    <Input value={getValue("owner_phone_number", "+218 91 211 0392")} onChange={(e) => setValue("owner_phone_number", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook Base URL</Label>
                    <Input value={getValue("webhook_base_url", "")} onChange={(e) => setValue("webhook_base_url", e.target.value)} placeholder="https://your-app.com" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("twilio", ["twilio_phone_number", "owner_phone_number", "webhook_base_url"])}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI */}
          <TabsContent value="ai" className="mt-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4 text-violet-600" />
                  AI Response Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
                  AI API keys are configured via environment variables. The system falls back to template-based responses when AI is not configured.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AI Provider</Label>
                    <Input value="OpenAI" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value="gpt-4o-mini" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Input value={getValue("ai_default_language", "ar")} onChange={(e) => setValue("ai_default_language", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input value={getValue("ai_temperature", "0.7")} onChange={(e) => setValue("ai_temperature", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("ai", ["ai_default_language", "ai_temperature"])}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Environment Variables Reference */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              Environment Variables Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Variable</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Purpose</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Required</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">DATABASE_URL</td><td className="px-3 py-2">MySQL connection string</td><td className="px-3 py-2"><Badge className="bg-rose-100 text-rose-700">Yes</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">OPENAI_API_KEY</td><td className="px-3 py-2">OpenAI API key</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">TWILIO_ACCOUNT_SID</td><td className="px-3 py-2">Twilio account identifier</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">TWILIO_AUTH_TOKEN</td><td className="px-3 py-2">Twilio authentication token</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">WHATSAPP_ACCESS_TOKEN</td><td className="px-3 py-2">Meta WhatsApp API token</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">WHATSAPP_PHONE_NUMBER_ID</td><td className="px-3 py-2">WhatsApp Business phone ID</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">MESSENGER_PAGE_ACCESS_TOKEN</td><td className="px-3 py-2">Facebook page access token</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">ELEVENLABS_API_KEY</td><td className="px-3 py-2">Voice generation API key</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                  <tr className="border-b border-slate-50"><td className="px-3 py-2 font-mono text-xs">APP_WEBHOOK_BASE_URL</td><td className="px-3 py-2">Public URL for webhooks</td><td className="px-3 py-2"><Badge className="bg-amber-100 text-amber-700">Optional</Badge></td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
