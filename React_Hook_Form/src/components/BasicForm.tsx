import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaPaperPlane,
  FaFileAlt,
} from "react-icons/fa";

// Define validation schema with Zod
const basicFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Age must be 18 or older"),
});

type BasicFormData = z.infer<typeof basicFormSchema>;

export function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
  });

  const onSubmit = async (data: BasicFormData) => {
    console.log("Form data:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>
        <FaFileAlt /> Basic Form
      </h2>

      <div className="form-group">
        <label htmlFor="name">
          <FaUser className="label-icon" /> Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={errors.name ? "error" : ""}
        />
        {errors.name && (
          <span className="error-message">{errors.name.message}</span>
        )}
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

      <div className="form-group">
        <label htmlFor="age">
          <FaBirthdayCake className="label-icon" /> Age
        </label>
        <input
          id="age"
          type="number"
          {...register("age", { valueAsNumber: true })}
          className={errors.age ? "error" : ""}
        />
        {errors.age && (
          <span className="error-message">{errors.age.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        <FaPaperPlane /> {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
