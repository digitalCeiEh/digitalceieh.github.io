import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Chat from "@/components/Chat";

// Use hash router for GitHub Pages compatibility
const Router = () => {
  return (
    <WouterRouter base="/">
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center p-4">
          <Chat />
        </main>
      </div>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;