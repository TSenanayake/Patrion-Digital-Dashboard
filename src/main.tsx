import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const telemetry = {
  setContext: (_key: string, _context: Record<string, unknown>) => {},
  setUser: (_user: { id: string; projectId?: string }) => {},
  setTag: (_key: string, _value: string) => {},
  setProjectContext: (_projectId: string) => {},
};

createRoot(document.getElementById("root")!).render(<App />);

export { telemetry };
