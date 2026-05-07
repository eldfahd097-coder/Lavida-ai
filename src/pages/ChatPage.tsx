import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Send, Waves } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to La Vida AI Receptionist. How may I assist you today? / أهلاً بك في مساعد لا فيدا الذكي، كيف يمكنني مساعدتك؟",
    },
  ]);

  const askMutation = trpc.chat.ask.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
  });

  const history = useMemo(
    () =>
      messages
        .slice(-10)
        .map((message) => ({ role: message.role, content: message.content })),
    [messages],
  );

  const sendMessage = () => {
    const value = text.trim();
    if (!value || askMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setText("");
    askMutation.mutate({ message: value, history });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-4">
        <Card className="border-[#eadfce] bg-gradient-to-r from-[#f6ecde] via-[#f8f1e7] to-[#f4ece0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-[#5a422a]">
              <Waves className="h-5 w-5 text-[#8f6b46]" />
              La Vida AI Receptionist
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-[#eadfce] bg-white/85 shadow-[0_12px_28px_-22px_rgba(101,79,54,0.45)]">
          <CardContent className="space-y-4 p-4">
            <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-[#fcf8f1] p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-[#7b5d3b] text-[#fff9ef]"
                        : "border border-[#ebdfce] bg-white text-[#5a4632]"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {askMutation.isPending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[#ebdfce] bg-white px-4 py-2 text-sm text-[#8d7860]">
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message / اكتب رسالتك"
                className="h-11 border-[#e7d7c2] bg-white/95"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={askMutation.isPending || !text.trim()}
                className="h-11 bg-[#7b5d3b] px-4 text-[#fff9ef] hover:bg-[#6a4f31]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
