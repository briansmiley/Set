import SetGame from "./components/Set/SetGame";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
        <SetGame />
      </div>
    </ThemeProvider>
  );
}
