import SetSolo from "./components/Set/SetSolo";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex min-h-[100dvh] min-w-[100dvw] flex-col items-center justify-center">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <SetSolo />
      </div>
    </ThemeProvider>
  );
}
