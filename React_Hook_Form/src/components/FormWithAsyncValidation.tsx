import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { FaSync, FaUser, FaEnvelope, FaSpinner, FaPaperPlane } from "react-icons/fa";

// Simulate API call to check if username already exists
const checkUsernameExists = async (username: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate: username "admin" and "test" already exist
  return ["admin", "test"].includes(username.toLowerCase());
};

// Schema with async validation
const asyncValidationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .refine(
      async (username) => {
        const exists = await checkUsernameExists(username);
        return !exists;
      },
      {
        message: "Username already exists",
      }
    ),
  email: z.string().email("Invalid email address"),
});

type AsyncValidationFormData = z.infer<typeof asyncValidationSchema>;

export function FormWithAsyncValidation() {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<AsyncValidationFormData>({
    resolver: zodResolver(asyncValidationSchema),
    mode: "onBlur", // Validate on blur to avoid too many validations
  });

  const handleUsernameBlur = async () => {
    setIsCheckingUsername(true);
    await trigger("username");
    setIsCheckingUsername(false);
  };

  const onSubmit = async (data: AsyncValidationFormData) => {
    console.log("Form data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>
        <FaSync /> Form with Async Validation
      </h2>

      <div className="form-group">
        <label htmlFor="username">
          <FaUser className="label-icon" /> Username
        </label>
        <div className="input-with-loader">
          <input
            id="username"
            type="text"
            {...register("username")}
            onBlur={handleUsernameBlur}
            className={errors.username ? "error" : ""}
          />
          {isCheckingUsername && (
            <span className="loading-indicator">
              <FaSpinner className="spinner" /> Checking...
            </span>
          )}
        </div>
        {errors.username && (
          <span className="error-message">{errors.username.message}</span>
        )}
        <small>Try entering "admin" or "test" to see validation error</small>
      </div>

      <div className="form-group">
        <label htmlFor="email">
          <FaEnvelope className="label-icon" /> Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "error" : ""}
        />
        {errors.email && (
          <span className="error-message">{errors.email.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || isCheckingUsername}>
        <FaPaperPlane /> {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

