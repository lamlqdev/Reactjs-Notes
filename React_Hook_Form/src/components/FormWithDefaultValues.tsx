import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
});

type FormData = z.infer<typeof formSchema>;

export function FormWithDefaultValues() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "john_doe",
      bio: "Software developer",
      country: "vn",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    alert("Form submitted!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Form with Default Values</h2>
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          {...register("username")}
          className={errors.username ? "error" : ""}
        />
        {errors.username && (
          <span className="error-message">{errors.username.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          {...register("bio")}
          className={errors.bio ? "error" : ""}
        />
        {errors.bio && (
          <span className="error-message">{errors.bio.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          {...register("country")}
          className={errors.country ? "error" : ""}
        >
          <option value="">-- Select country --</option>
          <option value="vn">Vietnam</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
        </select>
        {errors.country && (
          <span className="error-message">{errors.country.message}</span>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

