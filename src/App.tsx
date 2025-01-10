import SetGame from "./components/Set/SetGame";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex min-h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden px-2">
        <SetGame />
      </div>
    </ThemeProvider>
  );
}
