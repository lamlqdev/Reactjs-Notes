import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function FormWithWatch() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Watch firstName to display real-time
  const firstName = watch("firstName");
  const fullName = watch(["firstName", "lastName"]);

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    alert("Form submitted!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Form with Watch</h2>
      
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          className={errors.firstName ? "error" : ""}
        />
        {errors.firstName && (
          <span className="error-message">{errors.firstName.message}</span>
        )}
        {firstName && (
          <div className="watch-preview">Preview: {firstName}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          {...register("lastName")}
          className={errors.lastName ? "error" : ""}
        />
        {errors.lastName && (
          <span className="error-message">{errors.lastName.message}</span>
        )}
      </div>

      {fullName[0] && fullName[1] && (
        <div className="watch-preview">
          Full name: {fullName[0]} {fullName[1]}
        </div>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}

