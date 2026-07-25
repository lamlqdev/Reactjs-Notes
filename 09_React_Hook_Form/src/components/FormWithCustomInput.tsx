import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaPaperPlane, FaCode } from "react-icons/fa";

// Custom Input Component (Controlled Component)
interface CustomTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  placeholder?: string;
}

function CustomTextInput({
  value,
  onChange,
  onBlur,
  error,
  label,
  placeholder,
}: CustomTextInputProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={error ? "error" : ""}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Custom Select Component (Controlled Component)
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  options: { value: string; label: string }[];
}

function CustomSelect({
  value,
  onChange,
  onBlur,
  error,
  label,
  options,
}: CustomSelectProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={error ? "error" : ""}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Define validation schema
const customInputFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Please select a country"),
});

type CustomInputFormData = z.infer<typeof customInputFormSchema>;

export function FormWithCustomInput() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CustomInputFormData>({
    resolver: zodResolver(customInputFormSchema),
  });

  const onSubmit = async (data: CustomInputFormData) => {
    console.log("Form data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>
        <FaCode className="form-title-icon" /> Form with Custom Input Components
      </h2>

      <div className="info-box">
        <p>
          <strong>Controlled Components:</strong> Components where React Hook
          Form manages the state through <code>Controller</code>. The{" "}
          <code>control</code> object connects custom components to React Hook
          Form's state management.
        </p>
      </div>

      {/* Using Controller with CustomTextInput */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <CustomTextInput
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            label="Name"
            placeholder="Enter your name"
          />
        )}
      />

      {/* Using Controller with CustomTextInput for email */}
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <CustomTextInput
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            label="Email"
            placeholder="Enter your email"
          />
        )}
      />

      {/* Using Controller with CustomSelect */}
      <Controller
        name="country"
        control={control}
        render={({ field, fieldState }) => (
          <CustomSelect
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            label="Country"
            options={[
              { value: "vn", label: "Vietnam" },
              { value: "us", label: "United States" },
              { value: "uk", label: "United Kingdom" },
              { value: "jp", label: "Japan" },
            ]}
          />
        )}
      />

      <button type="submit" disabled={isSubmitting}>
        <FaPaperPlane /> {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
