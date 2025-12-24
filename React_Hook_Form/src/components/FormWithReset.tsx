import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function FormWithReset() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    alert("Form submitted!");
    // Reset form after successful submission
    reset();
  };

  const handleReset = () => {
    reset({
      title: "",
      description: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Form with Reset</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className={errors.title ? "error" : ""}
        />
        {errors.title && (
          <span className="error-message">{errors.title.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register("description")}
          className={errors.description ? "error" : ""}
        />
        {errors.description && (
          <span className="error-message">{errors.description.message}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isDirty}>
          Submit
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      {isDirty && <p className="dirty-indicator">Form has been modified</p>}
    </form>
  );
}

