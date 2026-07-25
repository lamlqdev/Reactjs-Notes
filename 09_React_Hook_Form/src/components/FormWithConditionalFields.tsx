import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema with conditional validation
const conditionalFormSchema = z
  .object({
    accountType: z.enum(["personal", "business"], {
      required_error: "Please select account type",
    }),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    personalId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "business") {
        return data.companyName && data.companyName.length > 0;
      }
      return true;
    },
    {
      message: "Company name is required for business accounts",
      path: ["companyName"],
    }
  )
  .refine(
    (data) => {
      if (data.accountType === "business") {
        return data.taxId && data.taxId.length > 0;
      }
      return true;
    },
    {
      message: "Tax ID is required for business accounts",
      path: ["taxId"],
    }
  )
  .refine(
    (data) => {
      if (data.accountType === "personal") {
        return data.personalId && data.personalId.length > 0;
      }
      return true;
    },
    {
      message: "Personal ID is required for personal accounts",
      path: ["personalId"],
    }
  );

type ConditionalFormData = z.infer<typeof conditionalFormSchema>;

export function FormWithConditionalFields() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConditionalFormData>({
    resolver: zodResolver(conditionalFormSchema),
    defaultValues: {
      accountType: "personal",
    },
  });

  const accountType = watch("accountType");

  const onSubmit = (data: ConditionalFormData) => {
    console.log("Form data:", data);
    alert("Form submitted successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h2>Form with Conditional Fields</h2>

      <div className="form-group">
        <label htmlFor="accountType">Account Type</label>
        <select
          id="accountType"
          {...register("accountType")}
          className={errors.accountType ? "error" : ""}
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>
        {errors.accountType && (
          <span className="error-message">{errors.accountType.message}</span>
        )}
      </div>

      {accountType === "business" && (
        <>
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              type="text"
              {...register("companyName")}
              className={errors.companyName ? "error" : ""}
            />
            {errors.companyName && (
              <span className="error-message">
                {errors.companyName.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="taxId">Tax ID *</label>
            <input
              id="taxId"
              type="text"
              {...register("taxId")}
              className={errors.taxId ? "error" : ""}
            />
            {errors.taxId && (
              <span className="error-message">{errors.taxId.message}</span>
            )}
          </div>
        </>
      )}

      {accountType === "personal" && (
        <div className="form-group">
          <label htmlFor="personalId">Personal ID *</label>
          <input
            id="personalId"
            type="text"
            {...register("personalId")}
            className={errors.personalId ? "error" : ""}
          />
          {errors.personalId && (
            <span className="error-message">{errors.personalId.message}</span>
          )}
        </div>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}

