import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Info } from "lucide-react";

const SalesChat = () => {
  const { user } = useAuth();
  const { salesData } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    
    const todaySales = salesData.filter(item => item.date === today);
    const todayRevenue = todaySales.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const todayItems = todaySales.length;
    
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      content: todaySales.length > 0 
        ? `Today's sales: ${todayItems} items sold for a total revenue of $${todayRevenue.toFixed(2)}.`
        : "No sales recorded today yet.",
      timestamp: new Date(),
      isSystemMessage: true
    };
    
    setMessages([systemMessage]);
  }, [salesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    setTimeout(() => {
      const responses = [
        "I'll look into that sales data right away.",
        "Great job on meeting your targets today!",
        "Let me analyze those numbers for you.",
        "Have you checked the latest sales report?",
        "The team is performing well this week."
      ];
      
      const responseMessage: ChatMessage = {
        id: `resp-${Date.now()}`,
        senderId: "assistant",
        senderName: "Sales Assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          Daily Sales Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 px-4 overflow-hidden">
        <ScrollArea className="h-[260px] pr-4">
          <div className="flex flex-col gap-3">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex gap-2 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.senderId === "assistant" ? "/placeholder.svg" : undefined} />
                    <AvatarFallback className={message.isSystemMessage ? "bg-primary/20 text-primary" : ""}>
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    message.senderId === user?.id 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : message.isSystemMessage 
                        ? 'bg-muted border border-border' 
                        : 'bg-secondary'
                  }`}
                >
                  {message.isSystemMessage && (
                    <p className="text-xs font-medium mb-1">System</p>
                  )}
                  {message.senderId === "assistant" && (
                    <p className="text-xs font-medium mb-1">Sales Assistant</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-[10px] mt-1 opacity-70 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.senderId === user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default SalesChat;
