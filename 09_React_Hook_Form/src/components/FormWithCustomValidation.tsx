import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Custom validation with Zod
const customValidationSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    website: z
      .string()
      .url("Invalid URL")
      .or(z.literal(""))
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CustomValidationFormData = z.infer<typeof customValidationSchema>;

export function FormWithCustomValidation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomValidationFormData>({
    resolver: zodResolver(customValidationSchema),
  });

  const onSubmit = (data: CustomValidationFormData) => {
    console.log("Form data:", data);
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Form with Custom Validation</h2>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "error" : ""}
        />
        {errors.password && (
          <span className="error-message">{errors.password.message}</span>
        )}
        <small>Password must be at least 8 characters, including uppercase, lowercase, and numbers</small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className={errors.confirmPassword ? "error" : ""}
        />
        {errors.confirmPassword && (
          <span className="error-message">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="0123456789"
          className={errors.phone ? "error" : ""}
        />
        {errors.phone && (
          <span className="error-message">{errors.phone.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="website">Website (optional)</label>
        <input
          id="website"
          type="url"
          {...register("website")}
          placeholder="https://example.com"
          className={errors.website ? "error" : ""}
        />
        {errors.website && (
          <span className="error-message">{errors.website.message}</span>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

