import SetGame from "./components/Set/SetGame";
import SocketTest from "./components/socketTest";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden px-2">
        <SetGame />
        <SocketTest />
      </div>
    </ThemeProvider>
  );
}
