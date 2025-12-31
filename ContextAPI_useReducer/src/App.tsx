import { AppProvider } from "./context/AppContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { Preview } from "./components/Preview";

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <Header />
        <div className="app-content">
          <Sidebar />
          <main className="main-content">
            <SettingsPanel />
            <Preview />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
