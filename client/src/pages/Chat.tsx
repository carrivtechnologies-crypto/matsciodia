import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Paperclip,
  Search,
  MoreVertical,
  Phone,
  Video,
  Users,
  Settings,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  attachmentUrl?: string;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  lastActive: Date;
  unreadCount: number;
  lastMessage?: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock users for demonstration
  const [users] = useState<ChatUser[]>([
    {
      id: "1",
      name: "Dr. Anil Kumar",
      email: "anil.kumar@matsci.edu",
      role: "teacher",
      lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      unreadCount: 3,
      lastMessage: "The physics lab session went well today. Students were very engaged!",
    },
    {
      id: "2",
      name: "Priya Sharma",
      email: "priya.sharma@student.edu",
      role: "student",
      lastActive: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      unreadCount: 0,
      lastMessage: "Thank you for the additional resources. They're very helpful.",
    },
    {
      id: "3",
      name: "Prof. Meera Singh",
      email: "meera.singh@matsci.edu",
      role: "teacher",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unreadCount: 1,
      lastMessage: "Could we schedule a meeting to discuss the new chemistry curriculum?",
    },
    {
      id: "4",
      name: "Rahul Mehta",
      email: "rahul.mehta@student.edu",
      role: "student",
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      unreadCount: 0,
      lastMessage: "I have a question about the assignment deadline.",
    },
  ]);

  // Mock messages for demonstration
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      senderId: "1",
      message: "Good morning! How are your students doing with the new physics concepts?",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
    },
    {
      id: "2",
      senderId: user?.id || "current",
      message: "They're adapting well. Some are struggling with quantum mechanics, but overall progress is good.",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true,
    },
    {
      id: "3",
      senderId: "1",
      message: "That's expected. Quantum mechanics is always challenging for beginners. Would you like me to prepare some additional resources?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
    {
      id: "4",
      senderId: user?.id || "current",
      message: "That would be fantastic! Especially some visual demonstrations would help.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
    },
    {
      id: "5",
      senderId: "1",
      message: "The physics lab session went well today. Students were very engaged!",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat') {
            setMessages(prev => [...prev, data.data]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current = ws;
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [isAuthenticated]);

  // Load mock messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setMessages(mockMessages);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center h-full">
      <Skeleton className="w-32 h-8" />
    </div>;
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !wsRef.current) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || "current",
      message: newMessage.trim(),
      timestamp: new Date(),
      read: false,
    };

    // Add to local messages immediately
    setMessages(prev => [...prev, message]);
    
    // Send via WebSocket
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        senderId: user?.id,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
      }));
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" data-testid="chat-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Chat</h1>
          <p className="text-muted-foreground">Communicate with students and teachers in real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </Badge>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Users List */}
        <Card className="glassmorphism neumorphism">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50"
                  data-testid="input-search-chat"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Users */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredUsers.map((chatUser) => (
                  <div
                    key={chatUser.id}
                    className={`p-3 rounded-xl cursor-pointer transition-colors hover:bg-muted/30 ${
                      selectedUser?.id === chatUser.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                    onClick={() => setSelectedUser(chatUser)}
                    data-testid={`chat-user-${chatUser.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chatUser.profileImage} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(chatUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          new Date().getTime() - chatUser.lastActive.getTime() < 5 * 60 * 1000 
                            ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm truncate">{chatUser.name}</h4>
                          {chatUser.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                              {chatUser.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {chatUser.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chatUser.lastActive)}
                          </span>
                        </div>
                        {chatUser.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {chatUser.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <Card className="glassmorphism neumorphism h-full">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedUser.profileImage} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {selectedUser.role}
                        </Badge>
                        <span>{formatTime(selectedUser.lastActive)}</span>
                        {isTyping && <span className="text-primary">Typing...</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" data-testid="button-voice-call">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-video-call">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-chat-settings">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id || message.senderId === "current";
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isOwn && (
                                message.read ? (
                                  <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                                ) : (
                                  <Check className="w-3 h-3 text-primary-foreground/70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" data-testid="button-attach-file">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-muted/50"
                        data-testid="input-message"
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glassmorphism neumorphism h-full">
              <CardContent className="p-12 text-center h-full flex items-center justify-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a user from the sidebar to start chatting.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
