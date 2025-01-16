import { useState } from "react";
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
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={sendMessage.isPending}>
                Send
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
