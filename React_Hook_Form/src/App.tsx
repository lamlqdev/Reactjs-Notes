import { useState } from "react";
import { BasicForm } from "./components/BasicForm";
import { FormWithWatch } from "./components/FormWithWatch";
import { AdvancedForm } from "./components/AdvancedForm";
import { FormWithCustomValidation } from "./components/FormWithCustomValidation";
import { FormWithAsyncValidation } from "./components/FormWithAsyncValidation";
import { FormWithConditionalFields } from "./components/FormWithConditionalFields";
import { FormWithCustomInput } from "./components/FormWithCustomInput";
import {
  FaFileAlt,
  FaEye,
  FaLayerGroup,
  FaShieldAlt,
  FaSync,
  FaCodeBranch,
  FaCode,
  FaRocket,
} from "react-icons/fa";
import "./App.css";

type FormExample =
  | "basic"
  | "watch"
  | "advanced"
  | "customValidation"
  | "asyncValidation"
  | "conditionalFields"
  | "customInput";

const formExamples: {
  key: FormExample;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "basic", label: "Basic Form", icon: FaFileAlt },
  { key: "watch", label: "Form with Watch", icon: FaEye },
  {
    key: "advanced",
    label: "Advanced Form (Nested & Arrays)",
    icon: FaLayerGroup,
  },
  {
    key: "customValidation",
    label: "Form with Custom Validation",
    icon: FaShieldAlt,
  },
  {
    key: "asyncValidation",
    label: "Form with Async Validation",
    icon: FaSync,
  },
  {
    key: "conditionalFields",
    label: "Form with Conditional Fields",
    icon: FaCodeBranch,
  },
  {
    key: "customInput",
    label: "Form with Custom Input Components",
    icon: FaCode,
  },
];

function App() {
  const [activeForm, setActiveForm] = useState<FormExample>("basic");

  const renderForm = () => {
    switch (activeForm) {
      case "basic":
        return <BasicForm />;
      case "watch":
        return <FormWithWatch />;
      case "advanced":
        return <AdvancedForm />;
      case "customValidation":
        return <FormWithCustomValidation />;
      case "asyncValidation":
        return <FormWithAsyncValidation />;
      case "conditionalFields":
        return <FormWithConditionalFields />;
      case "customInput":
        return <FormWithCustomInput />;
      default:
        return <BasicForm />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <FaRocket className="header-icon" />
          <div>
            <h1>React Hook Form + Zod Examples</h1>
            <p>
              Learn how to use React Hook Form combined with Zod for form
              validation
            </p>
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <h2>
            <FaFileAlt className="sidebar-title-icon" />
            Form Examples
          </h2>
          <nav className="nav-menu">
            {formExamples.map((example) => {
              const Icon = example.icon;
              return (
                <button
                  key={example.key}
                  onClick={() => setActiveForm(example.key)}
                  className={activeForm === example.key ? "active" : ""}
                >
                  <Icon className="nav-icon" />
                  {example.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="main-content">{renderForm()}</main>
      </div>
    </div>
  );
}

export default App;
