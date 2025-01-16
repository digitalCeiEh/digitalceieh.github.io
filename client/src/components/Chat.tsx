import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type Message = {
  content: string;
  timestamp: string;
  isUser: boolean;
};

// This URL should be updated with your GitHub Pages domain
const GITHUB_PAGES_URL = `${window.location.protocol}//${window.location.host}`;
const WEBHOOK_URL = "https://cesarem.app.n8n.cloud/webhook-test/4ab9ed06-5ce6-4dc2-877c-832100f7a80a";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      try {
        // Log the request payload for debugging
        console.log("Sending message to n8n:", {
          text: message,
          callback_url: `${GITHUB_PAGES_URL}/api/webhook/response`,
          timestamp: new Date().toISOString()
        });

        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
            callback_url: `${GITHUB_PAGES_URL}/api/webhook/response`,
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from n8n:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to send message: ${errorText}`);
        }

        const responseData = await response.json();
        console.log("Response from n8n:", responseData);

        return responseData;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      form.reset();
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof messageSchema>) {
    const newMessage: Message = {
      content: values.message,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    await sendMessage.mutateAsync(values.message);
  }

  // Polling function to check for new messages
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${GITHUB_PAGES_URL}/api/messages/latest`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.content) {
            setMessages((prev) => [...prev, {
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString(),
              isUser: false
            }]);
          }
        }
      } catch (error) {
        console.error("Error polling for messages:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-[400px] overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-background/50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation...
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="break-words">{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Type your message..."
                        {...field}
                        disabled={sendMessage.isPending}
                        className="bg-background"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={sendMessage.isPending}
                className="min-w-[80px]"
              >
                {sendMessage.isPending ? "Sending..." : "Send"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}