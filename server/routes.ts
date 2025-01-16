import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

// Store WebSocket connections
let connections: WebSocket[] = [];

export function registerRoutes(app: Express): Server {
  // Message webhook endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = {
        message: message,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // n8n response webhook endpoint
  app.post("/api/webhook/n8n", (req, res) => {
    try {
      const response = req.body;
      console.log("Received n8n response:", response);

      // Broadcast the response to all connected clients
      connections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "n8n_response",
            data: response
          }));
        }
      });

      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Error processing n8n webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws"
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection");
    connections.push(ws);

    ws.on("close", () => {
      connections = connections.filter(conn => conn !== ws);
      console.log("Client disconnected");
    });
  });

  return httpServer;
}