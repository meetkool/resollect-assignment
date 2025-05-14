import { Todo } from "@/types/todo";

// Define events that can be subscribed to
type WebSocketEventType = 'connect' | 'disconnect' | 'todo_list' | 'todo_create' | 'todo_update' | 'todo_delete' | 'error';

type Listener = (data: any) => void;

interface TodoListEvent {
  type: 'todo_list';
  todos: Todo[];
}

interface TodoCreateEvent {
  type: 'todo_create';
  todo: Todo;
}

interface TodoUpdateEvent {
  type: 'todo_update';
  todo: Todo;
}

interface TodoDeleteEvent {
  type: 'todo_delete';
  todo_id: string;
}

// Determine if we should use a mock WebSocket implementation
const USE_MOCK_WEBSOCKET = true; // Set to false when backend WebSockets are ready

/**
 * WebSocket service for real-time todo updates
 * Uses a mock implementation in development to avoid connection errors
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners = new Map<WebSocketEventType, Set<Listener>>();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds initial delay
  private isConnecting = false;
  private mockConnected = false;
  
  // Initialize the WebSocket connection
  public connect(): void {
    // Use mock implementation in development
    if (USE_MOCK_WEBSOCKET) {
      this.connectMock();
      return;
    }
    
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      // Get WebSocket URL based on current environment
      const wsUrl = this.getWebSocketUrl();
      console.log(`Connecting to WebSocket at: ${wsUrl}`);
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.notifyListeners('connect', { connected: true });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type as WebSocketEventType;
          
          if (type) {
            this.notifyListeners(type, data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        this.isConnecting = false;
        console.log(`WebSocket closed with code ${event.code}, reason: ${event.reason}`);
        this.notifyListeners('disconnect', { code: event.code, reason: event.reason });
        this.reconnect();
      };
      
      this.socket.onerror = (event) => {
        this.isConnecting = false;
        
        // Create a more meaningful error object
        const errorInfo = {
          message: 'WebSocket error occurred',
          timestamp: new Date().toISOString(),
          url: wsUrl,
          readyState: this.socket ? this.socket.readyState : 'unknown'
        };
        
        console.error('WebSocket error:', errorInfo);
        this.notifyListeners('error', errorInfo);
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('Error creating WebSocket:', error);
      this.reconnect();
    }
  }
  
  // Connect to mock WebSocket for development
  private connectMock(): void {
    if (this.mockConnected) {
      return;
    }
    
    console.log('Using mock WebSocket implementation');
    setTimeout(() => {
      this.mockConnected = true;
      this.notifyListeners('connect', { connected: true });
      console.log('Mock WebSocket connected');
    }, 500);
  }
  
  // Get WebSocket URL based on current environment
  private getWebSocketUrl(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'ws://localhost:8000/ws/todos/';
    }
    
    // Get the current host (works with any deployment)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // For development with backend on a different port
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'ws://localhost:8000/ws/todos/';
    }
    
    // For production deployment
    return `${protocol}//${host}/ws/todos/`;
  }
  
  // Close the WebSocket connection
  public disconnect(): void {
    if (USE_MOCK_WEBSOCKET) {
      this.mockConnected = false;
      this.notifyListeners('disconnect', { code: 1000, reason: 'User disconnected' });
      console.log('Mock WebSocket disconnected');
      return;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  // Subscribe to WebSocket events
  public subscribe(event: WebSocketEventType, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    // Return an unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }
  
  // Notify all listeners of an event
  private notifyListeners(event: WebSocketEventType, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
  
  // Request todos from the server
  public requestTodos(): void {
    if (USE_MOCK_WEBSOCKET) {
      console.log('Mock WebSocket: Requesting todos');
      // This is a no-op in mock mode - frontend will use REST API instead
      return;
    }
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'request_todos' }));
    } else {
      console.warn('WebSocket not connected, cannot request todos');
    }
  }
  
  // Attempt to reconnect to the WebSocket
  private reconnect(): void {
    if (USE_MOCK_WEBSOCKET) {
      this.connectMock();
      return;
    }
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Maximum reconnect attempts reached');
      return;
    }
    
    // Exponential backoff: delay * 2^attempts
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService(); 