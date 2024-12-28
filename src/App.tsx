import SetSolo from "./components/Set/SetSolo";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex min-h-[100dvh] min-w-[100dvw] flex-col items-center justify-center">
        <SetSolo />
      </div>
    </ThemeProvider>
  );
}
