# REACT HOOK FORM + ZOD

## Core terminology

**React Hook Form**:

- High-performance form management library for React.
- Reduces re-renders by using uncontrolled components and refs.
- Provides simple API for handling validation, errors, and form state.

**Zod**:

- TypeScript-first schema validation library.
- Allows defining schemas and automatically infers TypeScript types.
- Provides powerful validation with clear error messages.

**zodResolver**:

- Adapter from `@hookform/resolvers` to integrate Zod with React Hook Form.
- Converts Zod schema into format that React Hook Form understands.
- Automatically maps Zod errors to React Hook Form errors.

**useForm**:

- Main hook of React Hook Form for managing forms.
- Returns methods and state: `register`, `handleSubmit`, `formState`, `watch`, `reset`, etc.
- Accepts options like `resolver`, `defaultValues`, `mode`.

**register**:

- Function to register input with React Hook Form.
- Returns props to spread into input element: `{ name, onChange, onBlur, ref }`.
- Can accept options like `valueAsNumber`, `validate`.

**handleSubmit**:

- Function to handle form submission.
- Automatically validates form before calling callback.
- Accepts 2 callbacks: `onValid` (when validation passes) and `onInvalid` (when validation fails).

**formState**:

- Object containing form state: `errors`, `isValid`, `isDirty`, `isSubmitting`, `touchedFields`, etc.
- Automatically updates when form state changes.

**watch**:

- Function to watch values of fields.
- Can watch one field, multiple fields, or entire form.
- Triggers re-render when value changes.

**reset**:

- Function to reset form to initial values or new values.
- Can reset entire form or specific fields.

**useFieldArray**:

- Hook to manage dynamic arrays in forms.
- Provides methods: `append`, `remove`, `insert`, `move`, `swap`.
- Useful for forms with dynamic lists (addresses, items, etc.).

---

## Basic: Basic Form Usage

This section guides you through using React Hook Form with Zod in the most basic scenarios.

### Example 1: Basic Form with Zod Schema

**When to use**: When you need a simple form with basic validation.

**Example**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define Zod schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Age must be 18 or older"),
});

// 2. Infer TypeScript type from schema
type FormData = z.infer<typeof formSchema>;

function BasicForm() {
  // 3. Setup useForm with zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // 4. Handle submit
  const onSubmit = async (data: FormData) => {
    console.log(data);
    // API call...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register("age", { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

**Explanation**:

- `z.object()` creates schema for object with fields and validation rules
- `z.infer<typeof formSchema>` automatically creates TypeScript type from schema
- `zodResolver(formSchema)` integrates Zod with React Hook Form
- `register("fieldName")` registers input with form, returns props to spread into input
- `{ valueAsNumber: true }` converts string to number for input type="number"
- `errors.fieldName?.message` displays error message from Zod validation

**Syntax**:

- **Input**: `z.object({ field: z.string().min(2) })` → Zod schema
- **Output**: `{ name, onChange, onBlur, ref }` từ `register()`
- **Error**: `{ field: { message: string, type: string } }` trong `formState.errors`

### Example 2: Form with Default Values

**When to use**: When you want the form to have default values when loading.

**Example**:

```typescript
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
});

type FormData = z.infer<typeof formSchema>;

function FormWithDefaultValues() {
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
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      <textarea {...register("bio")} />
      <select {...register("country")}>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Explanation**:

- `defaultValues` in `useForm` options sets default values for form
- Form will be populated with these values when component mounts
- `isDirty` in `formState` will be `false` if form hasn't changed from default values

**Syntax**:

- **Input**: `defaultValues: { field: value }` → Object with default values
- **Output**: Form fields are filled with default values immediately on mount

### Example 3: Form with Watch - Real-time Updates

**When to use**: When you want to display field values in real-time or create conditional logic.

**Example**:

```typescript
function FormWithWatch() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Watch one field
  const firstName = watch("firstName");

  // Watch multiple fields
  const [firstName, lastName] = watch(["firstName", "lastName"]);

  // Watch entire form
  const formData = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} />
      {firstName && <div>Preview: {firstName}</div>}

      <input {...register("lastName")} />
      {firstName && lastName && (
        <div>
          Full name: {firstName} {lastName}
        </div>
      )}
    </form>
  );
}
```

**Explanation**:

- `watch("fieldName")` returns current value of field and triggers re-render when value changes
- `watch(["field1", "field2"])` returns array of values from fields
- `watch()` with no arguments returns entire form data
- Component will re-render whenever watched values change

**Syntax**:

- **Input**: `watch("field")` or `watch(["field1", "field2"])` or `watch()`
- **Output**: Current value of field(s) or entire form

### Example 4: Form with Reset

**When to use**: When you want to reset form to initial values or clear form after submission.

**Example**:

```typescript
function FormWithReset() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Submit data...
    // Reset form after successful submission
    reset();
  };

  const handleReset = () => {
    // Reset to default values
    reset();

    // Or reset to new values
    reset({
      title: "",
      description: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} />
      <textarea {...register("description")} />

      <button type="submit" disabled={!isDirty}>
        Submit
      </button>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}
```

**Explanation**:

- `reset()` resets form to initial `defaultValues`
- `reset(newValues)` resets form to newly provided values
- `isDirty` in `formState` indicates whether form has been modified
- After reset, `isDirty` will return to `false`

**Syntax**:

- **Input**: `reset()` or `reset({ field: value })`
- **Output**: Form is reset to initial values or new values

---

## Advanced: Advanced Form Usage

This section guides you through more complex patterns and advanced features.

### Example 1: Form with Nested Objects

**When to use**: When form has complex data structure with nested objects.

**Example**:

```typescript
const nestedFormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
  }),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
});

type NestedFormData = z.infer<typeof nestedFormSchema>;

function NestedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NestedFormData>({
    resolver: zodResolver(nestedFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Nested object fields use dot notation */}
      <input {...register("personalInfo.firstName")} />
      {errors.personalInfo?.firstName && (
        <span>{errors.personalInfo.firstName.message}</span>
      )}

      <input {...register("address.street")} />
      {errors.address?.street && <span>{errors.address.street.message}</span>}
    </form>
  );
}
```

**Explanation**:

- Zod schema can be nested with `z.object()` inside `z.object()`
- Use dot notation `"personalInfo.firstName"` in `register()` to access nested fields
- Error path also uses dot notation: `errors.personalInfo?.firstName`
- TypeScript type is automatically inferred with nested structure

**Syntax**:

- **Input**: `register("parent.child")` → Dot notation for nested fields
- **Output**: Form data has structure `{ parent: { child: value } }`

### Example 2: Form with Dynamic Arrays (useFieldArray)

**When to use**: When form has dynamic list of items (addresses, products, etc.).

**Example**:

```typescript
const arrayFormSchema = z.object({
  addresses: z
    .array(
      z.object({
        street: z.string().min(5),
        city: z.string().min(2),
        zipCode: z.string().regex(/^\d{5}$/),
      })
    )
    .min(1, "Must have at least 1 address"),
});

type ArrayFormData = z.infer<typeof arrayFormSchema>;

function ArrayForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ArrayFormData>({
    resolver: zodResolver(arrayFormSchema),
    defaultValues: {
      addresses: [{ street: "", city: "", zipCode: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`addresses.${index}.street`)} />
          <input {...register(`addresses.${index}.city`)} />
          <input {...register(`addresses.${index}.zipCode`)} />
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ street: "", city: "", zipCode: "" })}
      >
        Add Address
      </button>
    </form>
  );
}
```

**Explanation**:

- `useFieldArray` manages dynamic arrays in form
- `fields` is array of field objects with unique `id`
- `append(newItem)` adds new item to end of array
- `remove(index)` removes item at index
- `insert(index, newItem)` inserts item at index
- Use `register(\`addresses.${index}.field\`)` to register array fields
- `field.id` is used as `key` in map (don't use `index`)

**Syntax**:

- **Input**: `useFieldArray({ control, name: "fieldName" })`
- **Output**: `{ fields, append, remove, insert, move, swap }`
- **Register**: `register(\`fieldName.${index}.nestedField\`)`

### Example 3: Form with Custom Validation

**When to use**: When you need complex validation rules not available in Zod or need cross-field validation.

**Example**:

```typescript
const customValidationSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error will be displayed on confirmPassword field
  });

function CustomValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customValidationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" {...register("confirmPassword")} />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
    </form>
  );
}
```

**Explanation**:

- `.refine()` allows complex custom validation logic
- Function receives entire form data and returns boolean
- `path` in options specifies which field will display error
- Can use `.superRefine()` for more complex validation with multiple errors

**Syntax**:

- **Input**: `.refine((data) => condition, { message, path })`
- **Output**: Validation error is added to field specified in `path`

### Example 4: Form with Async Validation

**When to use**: When you need to validate with API call (check if username exists, email is already used, etc.).

**Example**:

```typescript
const checkUsernameExists = async (username: string): Promise<boolean> => {
  const response = await fetch(`/api/check-username?username=${username}`);
  const data = await response.json();
  return data.exists;
};

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
});

function AsyncValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(asyncValidationSchema),
    mode: "onBlur", // Validate on blur to avoid too many validations
  });

  const handleUsernameBlur = async () => {
    await trigger("username"); // Trigger validation for username field
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} onBlur={handleUsernameBlur} />
      {errors.username && <span>{errors.username.message}</span>}
    </form>
  );
}
```

**Explanation**:

- Zod schema can use async function in `.refine()`
- `trigger("fieldName")` manually triggers validation for a field
- `mode: "onBlur"` only validates on blur to avoid too many validations while typing
- Can use `mode: "onChange"` for real-time validation or `mode: "onSubmit"` to only validate on submit

**Syntax**:

- **Input**: `.refine(async (data) => await check(), { message })`
- **Output**: Async validation is performed, error displays when validation fails

### Example 5: Form with Conditional Fields

**When to use**: When some fields only display/required based on value of another field.

**Example**:

```typescript
const conditionalFormSchema = z
  .object({
    accountType: z.enum(["personal", "business"]),
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

function ConditionalForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(conditionalFormSchema),
  });

  const accountType = watch("accountType");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register("accountType")}>
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>

      {accountType === "business" && (
        <>
          <input {...register("companyName")} />
          {errors.companyName && <span>{errors.companyName.message}</span>}

          <input {...register("taxId")} />
          {errors.taxId && <span>{errors.taxId.message}</span>}
        </>
      )}

      {accountType === "personal" && (
        <input {...register("personalId")} />
        {errors.personalId && <span>{errors.personalId.message}</span>}
      )}
    </form>
  );
}
```

**Explanation**:

- Use `watch()` to watch value of field that determines conditional logic
- Conditional rendering in JSX based on watched value
- Zod schema uses `.refine()` to validate conditional requirements
- Validation only applies when condition is met

**Syntax**:

- **Input**: `watch("fieldName")` → Current value of field
- **Output**: Conditional rendering and validation based on value

---

## Summary of React Hook Form + Zod Benefits

1. **Performance**: React Hook Form uses uncontrolled components and refs, reducing re-renders
2. **Type Safety**: Zod schema automatically infers TypeScript types, ensuring type safety
3. **Validation**: Zod provides powerful validation with clear error messages
4. **Developer Experience**: Simple API, easy to use, less boilerplate code
5. **Flexibility**: Supports nested objects, arrays, conditional validation, async validation
6. **Integration**: `zodResolver` integrates Zod with React Hook Form seamlessly

---

## Learn More

After mastering the basic and advanced concepts above, you can continue learning the following topics:

### 1. Form Validation Modes

**Validation modes** in React Hook Form:

- **`onSubmit`** (default): Validate when submitting form
- **`onBlur`**: Validate when blurring from field
- **`onChange`**: Validate every time value changes
- **`onTouched`**: Validate after first blur, then validate onChange
- **`all`**: Validate on both blur and change

**Example**:

```typescript
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur", // Validate on blur
  reValidateMode: "onChange", // Re-validate on change after first time
});
```

**Documentation**: [React Hook Form Validation Modes](https://react-hook-form.com/get-started#Applyvalidation)

### 2. Advanced Zod Features

**Advanced Zod features**:

- **`.transform()`**: Transform value after validation
- **`.superRefine()`**: Custom validation with multiple errors
- **`.parseAsync()`**: Async parsing
- **`.safeParse()`**: Parse without throwing error, returns result object
- **Discriminated unions**: Validation for complex union types

**Example**:

```typescript
const schema = z.object({
  age: z.string().transform((val) => parseInt(val)),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
});

// Safe parse
const result = schema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
```

**Documentation**: [Zod Documentation](https://zod.dev/)

### 3. Custom Input Components

**Integrating React Hook Form with custom components**:

- Use `Controller` component for controlled components
- Use `useController` hook for custom hooks
- Forward refs for custom input components

**Example**:

```typescript
import { Controller } from "react-hook-form";

function CustomInput({ control, name }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <input {...field} />
          {fieldState.error && <span>{fieldState.error.message}</span>}
        </div>
      )}
    />
  );
}
```

**Documentation**: [React Hook Form Controller](https://react-hook-form.com/docs/usecontroller)

### 4. Form with File Upload

**Handling file upload**:

- Use `FileList` type in Zod
- Validate file size, type, etc.
- Preview file before upload

**Example**:

```typescript
const fileSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Please select a file")
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      "File must be smaller than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files[0]?.type),
      "Only JPEG or PNG files are accepted"
    ),
});
```

### 5. Form with Multi-step/Wizard

**Creating multi-step form**:

- Manage step state
- Validate each step before moving to next step
- Save data from previous steps

**Example**:

```typescript
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, trigger, formState } = useForm({
    resolver: zodResolver(schema),
  });

  const nextStep = async () => {
    const isValid = await trigger(); // Validate current step
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <form>
      {step === 1 && <Step1 register={register} />}
      {step === 2 && <Step2 register={register} />}
      {step === 3 && <Step3 register={register} />}
      <button type="button" onClick={nextStep}>
        Next
      </button>
    </form>
  );
}
```

### 6. Form with Dependent Fields

**Fields dependent on each other**:

- Use `watch()` to watch value of another field
- Update field options based on value of another field
- Dynamic validation rules

**Example**:

```typescript
function DependentFieldsForm() {
  const { register, watch } = useForm();
  const country = watch("country");

  return (
    <form>
      <select {...register("country")}>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
      </select>

      {country === "vn" && (
        <select {...register("city")}>
          <option value="hanoi">Hanoi</option>
          <option value="hcm">Ho Chi Minh</option>
        </select>
      )}

      {country === "us" && (
        <select {...register("state")}>
          <option value="ny">New York</option>
          <option value="ca">California</option>
        </select>
      )}
    </form>
  );
}
```

### 7. Performance Optimization

**Performance optimization**:

- Use `React.memo` for form components
- Avoid unnecessary re-renders with `shouldUnregister`
- Use `useMemo` for expensive calculations
- Debounce validation for async validation

**Example**:

```typescript
const { register } = useForm({
  resolver: zodResolver(schema),
  shouldUnregister: true, // Unregister fields when unmount
});

// Debounce async validation
const debouncedCheck = useMemo(
  () =>
    debounce(async (value) => {
      return await checkUsername(value);
    }, 500),
  []
);
```

### 8. Testing Forms

**Testing** forms with React Hook Form:

- Test validation errors
- Test form submission
- Test conditional fields
- Mock async validation

**Example**:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { zodResolver } from "@hookform/resolvers/zod";

test("shows validation error", async () => {
  render(<Form />);
  const input = screen.getByLabelText("Email");
  fireEvent.blur(input);
  expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
});
```

**Documentation**: [Testing React Hook Form](https://react-hook-form.com/advanced-usage#TestingForm)

### 9. Integration with UI Libraries

**Integrating with UI libraries**:

- Material-UI: Use `Controller` with MUI components
- Ant Design: Integrate with Form.Item
- Chakra UI: Use with FormControl
- React Select: Controller with react-select

**Example with Material-UI**:

```typescript
import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

<Controller
  name="email"
  control={control}
  render={({ field, fieldState }) => (
    <TextField
      {...field}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>;
```

---

## Summary

1. **React Hook Form**: High-performance form management with uncontrolled components
2. **Zod**: Schema validation with TypeScript type inference
3. **zodResolver**: Integrates Zod with React Hook Form
4. **Basic usage**: `register`, `handleSubmit`, `formState`, `watch`, `reset`
5. **Advanced features**: Nested objects, arrays, custom validation, async validation, conditional fields
6. **Best practices**: Proper validation modes, error handling, performance optimization

---

**References**:

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- [React Hook Form API Reference](https://react-hook-form.com/docs/useform)
