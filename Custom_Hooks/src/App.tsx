import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import UseLocalStorageDemo from "./pages/UseLocalStorageDemo";
import UseDebounceDemo from "./pages/UseDebounceDemo";
import UseToggleDemo from "./pages/UseToggleDemo";
import UseWindowSizeDemo from "./pages/UseWindowSizeDemo";
import UseFetchDemo from "./pages/UseFetchDemo";
import UsePreviousDemo from "./pages/UsePreviousDemo";

type Page =
  | "home"
  | "useLocalStorage"
  | "useDebounce"
  | "useToggle"
  | "useWindowSize"
  | "useFetch"
  | "usePrevious";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "useLocalStorage":
        return <UseLocalStorageDemo />;
      case "useDebounce":
        return <UseDebounceDemo />;
      case "useToggle":
        return <UseToggleDemo />;
      case "useWindowSize":
        return <UseWindowSizeDemo />;
      case "useFetch":
        return <UseFetchDemo />;
      case "usePrevious":
        return <UsePreviousDemo />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
