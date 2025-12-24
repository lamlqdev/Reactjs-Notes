import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Complex validation schema with nested objects and arrays
const advancedFormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
  }),
  addresses: z
    .array(
      z.object({
        street: z.string().min(5, "Street must be at least 5 characters"),
        city: z.string().min(2, "City must be at least 2 characters"),
        zipCode: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits"),
      })
    )
    .min(1, "Must have at least 1 address"),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }),
});

type AdvancedFormData = z.infer<typeof advancedFormSchema>;

export function AdvancedForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AdvancedFormData>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      addresses: [{ street: "", city: "", zipCode: "" }],
      preferences: {
        newsletter: false,
        notifications: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const onSubmit = (data: AdvancedFormData) => {
    console.log("Form data:", data);
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Advanced Form - Nested Objects & Arrays</h2>

      <div className="form-section">
        <h3>Personal Information</h3>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            {...register("personalInfo.firstName")}
            className={errors.personalInfo?.firstName ? "error" : ""}
          />
          {errors.personalInfo?.firstName && (
            <span className="error-message">
              {errors.personalInfo.firstName.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            {...register("personalInfo.lastName")}
            className={errors.personalInfo?.lastName ? "error" : ""}
          />
          {errors.personalInfo?.lastName && (
            <span className="error-message">
              {errors.personalInfo.lastName.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("personalInfo.email")}
            className={errors.personalInfo?.email ? "error" : ""}
          />
          {errors.personalInfo?.email && (
            <span className="error-message">
              {errors.personalInfo.email.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Addresses</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="address-item">
            <div className="form-group">
              <label>Street</label>
              <input
                {...register(`addresses.${index}.street`)}
                className={
                  errors.addresses?.[index]?.street ? "error" : ""
                }
              />
              {errors.addresses?.[index]?.street && (
                <span className="error-message">
                  {errors.addresses[index]?.street?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                {...register(`addresses.${index}.city`)}
                className={errors.addresses?.[index]?.city ? "error" : ""}
              />
              {errors.addresses?.[index]?.city && (
                <span className="error-message">
                  {errors.addresses[index]?.city?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                {...register(`addresses.${index}.zipCode`)}
                className={
                  errors.addresses?.[index]?.zipCode ? "error" : ""
                }
              />
              {errors.addresses?.[index]?.zipCode && (
                <span className="error-message">
                  {errors.addresses[index]?.zipCode?.message}
                </span>
              )}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="remove-button"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {errors.addresses && typeof errors.addresses === "object" && (
          <span className="error-message">
            {errors.addresses.root?.message}
          </span>
        )}
        <button
          type="button"
          onClick={() => append({ street: "", city: "", zipCode: "" })}
          className="add-button"
        >
          Add Address
        </button>
      </div>

      <div className="form-section">
        <h3>Preferences</h3>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              {...register("preferences.newsletter")}
            />
            Subscribe to newsletter
          </label>
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              {...register("preferences.notifications")}
            />
            Enable notifications
          </label>
        </div>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

