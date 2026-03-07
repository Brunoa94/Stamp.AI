# Shared UI Components

Below are shared/reusable UI primitives from `src/features/ui/` with full source code.

---

## Button

- Path: `src/features/ui/button.tsx`
- Component: `Button`
- Description: Base button with variants and sizes.

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

---

## Input

- Path: `src/features/ui/input.tsx`
- Component: `Input`
- Description: Base text input.

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

---

## Textarea

- Path: `src/features/ui/textarea.tsx`
- Component: `Textarea`
- Description: Base textarea.

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
```

---

## Select

- Path: `src/features/ui/select.tsx`
- Components: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, ...
- Description: Radix Select primitive wrappers.

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 md:text-sm",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

---

## Label

- Path: `src/features/ui/label.tsx`
- Component: `Label`
- Description: Radix label wrapper.

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
```

---

## Form

- Path: `src/features/ui/form.tsx`
- Components: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`
- Description: RHF form helpers.

```tsx
"use client";

import * as React from "react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/features/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
```

---

## FormField

- Path: `src/features/ui/form-field.tsx`
- Component: `FormField`
- Description: Simple label+input field.

```tsx
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import type { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegisterReturn;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  error,
  register,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...register}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Dialog

- Path: `src/features/ui/dialog.tsx`
- Components: `Dialog`, `DialogContent`, `DialogHeader`, ...
- Description: Radix dialog wrapper.

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

---

## Dropdown Menu

- Path: `src/features/ui/dropdown-menu.tsx`
- Description: Radix dropdown menu wrappers.

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
```

---

## Tabs

- Path: `src/features/ui/tabs.tsx`

```tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

---

## Sheet

- Path: `src/features/ui/sheet.tsx`

```tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
```

---

## Alert

- Path: `src/features/ui/alert.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
```

---

## Pagination

- Path: `src/features/ui/pagination.tsx`

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ButtonProps, buttonVariants } from "./button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  size?: ButtonProps["size"];
} & React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon-sm",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "default" : "outline",
        size,
      }),
      "cursor-pointer",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="icon-sm"
    className={cn("", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="icon-sm"
    className={cn("", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
```

---

## Paginator

- Path: `src/features/ui/paginator.tsx`

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import { cn } from "@/lib/utils";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  className?: string;
}

export function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  canGoPrevious,
  canGoNext,
  startIndex,
  endIndex,
  totalItems,
  className,
}: PaginatorProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-gray-700/50 mt-6 w-full",
        className,
      )}
    >
      {/* Results info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 w-full">
        Showing{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {startIndex}
        </span>{" "}
        to{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {endIndex}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {totalItems}
        </span>{" "}
        results
      </div>

      {/* Pagination controls */}
      <Pagination className="flex items-center justify-end">
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
              className={cn(
                "border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/20",
                !canGoPrevious && "opacity-50 pointer-events-none",
              )}
            />
          </PaginationItem>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const isActive = page === currentPage;

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={isActive}
                  className={cn(
                    isActive
                      ? "bg-linear-to-r from-slate-600 to-gray-700 text-white hover:from-slate-700 hover:to-gray-800 shadow-md border-transparent"
                      : "border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/20 text-gray-700 dark:text-gray-300",
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => canGoNext && onPageChange(currentPage + 1)}
              className={cn(
                "border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/20",
                !canGoNext && "opacity-50 pointer-events-none",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
```

---

## WizardActionFooter

- Path: `src/features/ui/wizard-action-footer.tsx`

```tsx
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface WizardActionFooterProps {
  onCancel?: () => void;
  onBack?: () => void;
  onContinue?: () => void;
  continueText?: string;
  continueIcon?: React.ReactNode;
  canContinue?: boolean;
  showBack?: boolean;
  showCancel?: boolean;
  cancelText?: string;
}

const buttonStyles = {
  cancel:
    "px-8 py-3 text-slate-500 font-normal font-heading text-xl tracking-widest hover:text-slate-800 transition-all duration-300",
  back: "px-8 py-3 text-slate-500 font-normal font-heading text-xl tracking-widest hover:text-slate-900 transition-all duration-300",
  backDisabled:
    "px-8 py-3 text-slate-300 font-normal font-heading text-xl tracking-widest cursor-not-allowed",
  continue:
    "px-12 py-4 bg-[#7C3AED] text-white font-normal font-heading text-2xl tracking-widest rounded shadow-xl shadow-purple-500/40 transition-all duration-300 hover:bg-[#6D28D9] hover:-translate-y-1 hover:shadow-2xl flex items-center gap-3",
  continueDisabled:
    "px-12 py-4 bg-slate-200 text-slate-400 font-normal font-heading text-2xl tracking-widest rounded shadow-sm cursor-not-allowed flex items-center gap-3",
} as const;

export function WizardActionFooter({
  onCancel,
  onBack,
  onContinue,
  continueText = "Continue",
  continueIcon,
  canContinue = true,
  showBack = true,
  showCancel = true,
  cancelText = "Cancel",
}: WizardActionFooterProps) {
  const isDisabled = !canContinue || !onContinue;

  return (
    <div className="px-12 py-10 bg-white/30 backdrop-blur-lg border-t border-white/20 flex justify-between items-center">
      {showCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className={buttonStyles.cancel}
        >
          {cancelText}
        </button>
      ) : (
        <div />
      )}

      <div className="flex gap-6">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className={onBack ? buttonStyles.back : buttonStyles.backDisabled}
          >
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={isDisabled}
          className={clsx({
            [buttonStyles.continue]: !isDisabled,
            [buttonStyles.continueDisabled]: isDisabled,
          })}
        >
          {continueText}
          {continueIcon || <ArrowRight className="text-2xl" />}
        </button>
      </div>
    </div>
  );
}
```

---

## WizardContent

- Path: `src/features/ui/wizard-content.tsx`

```tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface WizardContentProps {
  children: ReactNode;
  description?: string;
  showActions?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  className?: string;
}

export function WizardContent({
  children,
  description,
  showActions = true,
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  isNextDisabled = false,
  className,
}: WizardContentProps) {
  return (
    <>
      {/* Active Step Content */}
      <div className={clsx("flex-1 p-10 flex flex-col", className)}>
        {description && (
          <p className="text-slate-600 mb-8 max-w-2xl text-lg">{description}</p>
        )}

        {children}
      </div>

      {/* Step Footer Actions */}
      {showActions && (
        <div className="px-10 py-6 flex justify-end gap-4 border-t border-slate-100">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {backLabel}
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled}
              className={clsx(
                "px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2",
                {
                  "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40":
                    !isNextDisabled,
                  "bg-slate-200 text-slate-400 cursor-not-allowed":
                    isNextDisabled,
                },
              )}
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}
```

---

## WizardLayout

- Path: `src/features/ui/wizard-layout.tsx`

```tsx
import { ReactNode } from "react";

interface WizardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WizardLayout({
  sidebar,
  children,
  className,
}: WizardLayoutProps) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-[700px] bg-white shadow-lg rounded-2xl overflow-hidden">
      {/* Left Sidebar */}
      {sidebar}

      {/* Right Content Panel */}
      <section className="flex-1 flex flex-col bg-white relative">
        {children}
      </section>
    </div>
  );
}
```

---

## WizardSectionHeader

- Path: `src/features/ui/wizard-section-header.tsx`

```tsx
import clsx from "clsx";

interface WizardSectionHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  currentStep?: number;
}

export function WizardSectionHeader({
  stepNumber,
  totalSteps,
  title,
  currentStep = 1,
}: WizardSectionHeaderProps) {
  return (
    <div className="px-12 py-12 relative flex items-center justify-between overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-purple-600 tracking-[0.2em] uppercase bg-purple-50 px-2 py-1 rounded border border-purple-100">
            Step {stepNumber.toString().padStart(2, "0")}
          </span>
          <div className="h-px w-12 bg-gradient-to-r from-purple-400/40 to-transparent" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <div className="mt-3 flex gap-1">
          <div className="h-1 w-12 bg-purple-600 rounded-full" />
          <div className="h-1 w-2 bg-purple-400/40 rounded-full" />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              {
                "bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]":
                  index + 1 === currentStep,
                "bg-slate-200": index + 1 !== currentStep,
              },
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## WizardSidebar

- Path: `src/features/ui/wizard-sidebar.tsx`

```tsx
import { LucideIcon, Info } from "lucide-react";
import { WizardStep } from "./wizard-step";

export interface WizardStepConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface WizardSidebarProps {
  steps: WizardStepConfig[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  completedSteps?: string[];
  helpTitle?: string;
  helpDescription?: string;
}

export function WizardSidebar({
  steps,
  currentStepId,
  onStepClick,
  completedSteps = [],
  helpTitle = "Pro Tip",
  helpDescription = "High-resolution PNGs with transparent backgrounds work best for our AI generator.",
}: WizardSidebarProps) {
  return (
    <aside className="w-80 border-r border-white/20 flex flex-col bg-white/5 backdrop-blur-md min-h-[750px]">
      <div className="p-8 pb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-10 border-b border-slate-200 pb-2 font-accent">
          Design Pipeline
        </h2>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => (
            <WizardStep
              key={step.id}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isActive={step.id === currentStepId}
              isCompleted={completedSteps.includes(step.id)}
              onClick={() => onStepClick?.(step.id)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Info Box */}
      <div className="mt-auto p-8">
        <div className="bg-white/30 rounded-lg p-6 border border-white/20 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#7C3AED]">
            <Info className="text-lg" />
            <span className="font-bold text-xs uppercase tracking-wider font-accent">
              {helpTitle}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-accent">
            {helpDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}
```

---

## WizardStep

- Path: `src/features/ui/wizard-step.tsx`

```tsx
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface WizardStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

const stepStyles = {
  container:
    "flex items-center gap-4 p-5 rounded transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group cursor-pointer",
  active:
    "bg-gradient-to-r from-[#F3ECFF] to-transparent border-r-[3px] border-[#7C3AED]",
  iconBox:
    "w-12 h-12 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
  iconActive:
    "bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]",
  iconInactive:
    "border-white/30 text-slate-400 group-hover:border-[#7C3AED]/30 group-hover:text-[#7C3AED] bg-white/30",
} as const;

export function WizardStep({
  icon: Icon,
  title,
  description,
  isActive = false,
  isCompleted = false,
  onClick,
}: WizardStepProps) {
  return (
    <div
      className={clsx(stepStyles.container, {
        [stepStyles.active]: isActive,
      })}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-current={isActive ? "step" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div
        className={clsx(stepStyles.iconBox, {
          [stepStyles.iconActive]: isActive,
          [stepStyles.iconInactive]: !isActive,
        })}
      >
        <Icon className="text-2xl" />
      </div>
      <div>
        <h3
          className={clsx(
            "font-normal text-xl tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-heading",
            {
              "text-slate-900": isActive,
              "text-slate-400 group-hover:text-slate-900": !isActive,
            },
          )}
        >
          {title}
        </h3>
        <p
          className={clsx("text-xs font-medium mt-0.5 font-accent", {
            "text-slate-500": isActive,
            "text-slate-400": !isActive,
          })}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
```

---

## WizardStepHeader

- Path: `src/features/ui/wizard-step-header.tsx`

```tsx
interface WizardStepHeaderProps {
  stepNumber: string;
  title: string;
  description: string;
  currentDot: number;
  totalDots: number;
}

const dotStyles = {
  active: "w-3 h-3 rounded-sm bg-[#7C3AED]",
  inactive:
    "w-3 h-3 rounded-sm bg-slate-200 transition-colors hover:bg-slate-300",
} as const;

export function WizardStepHeader({
  stepNumber,
  title,
  description,
  currentDot,
  totalDots,
}: WizardStepHeaderProps) {
  return (
    <div className="px-12 pt-14 pb-10 flex justify-between items-end">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-[#F3ECFF] text-[#7C3AED] text-xs font-bold font-accent rounded-sm uppercase tracking-widest">
            {stepNumber}
          </span>
          <div className="h-px w-12 bg-slate-200" />
        </div>
        <h2 className="text-5xl font-normal font-heading text-slate-900 tracking-wide">
          {title}
        </h2>
        <p className="text-slate-500 mt-4 text-lg font-light">{description}</p>
      </div>

      {/* Step dots */}
      <div className="flex gap-3 pb-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={
              index === currentDot ? dotStyles.active : dotStyles.inactive
            }
          />
        ))}
      </div>
    </div>
  );
}
```

---

## WizardStepSpacer

- Path: `src/features/ui/wizard-step-spacer.tsx`

```tsx
/**
 * Visual spacer component to show alignment between steps and header
 * This helps visualize the scroll synchronization
 */
export function WizardStepSpacer() {
  return (
    <div className="relative h-px my-2">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />
    </div>
  );
}
```

---

## PageHeader

- Path: `src/features/ui/page-header.tsx`

```tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme, componentThemes } from "@/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
  variant?: "default" | "gradient";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  align = "center",
  variant = "gradient",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-12 mt-4 space-y-4", className)}>
      <div className="flex items-start gap-4">
        {Icon && <Icon className="w-12 h-12 text-slate-600" />}
        <h1 className={theme.dashboard.title}>{title}</h1>
      </div>
      <p className={theme.dashboard.subtitle}>{subtitle}</p>
    </header>
  );
}
```

---

## PageSubsectionVertical

- Path: `src/features/ui/page-subsection-vertical.tsx`

```tsx
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface Props {
  title: string;
  description: string;
}

export default function PageSubsectionVertical({ title, description }: Props) {
  return (
    <div className={`flex flex-col gap-3 ${notoSans.className}`}>
      <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </p>
      <p className="text-base text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
```

---

## FilterSelect

- Path: `src/features/ui/filter-select.tsx`

```tsx
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps<T extends string = string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}: FilterSelectProps<T>) {
  return (
    <div className={className}>
      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

## PasswordInput

- Path: `src/features/ui/password-input.tsx`

```tsx
import { useState } from "react";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  disabled = false,
  hint,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hintId = hint ? `${id}_hint` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-describedby={hintId}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          disabled={disabled}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
```

---

## WordCountIndicator

- Path: `src/features/ui/WordCountIndicator.tsx`

```tsx
import { AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import ProgressBar from "@/features/formFields/components/ProgressBar";
import { getWordCountColor } from "@/utils/formUtils";

interface Props {
  wordCount: number;
  limit: number;
  isOverLimit: boolean;
  colorClass?: string;
  showProgressBar?: boolean;
}

const WordCountIndicator = ({
  wordCount,
  limit,
  isOverLimit,
  colorClass,
  showProgressBar = true,
}: Props) => {
  const computedColorClass = colorClass || getWordCountColor(wordCount, limit);

  return (
    <div className={clsx("space-y-3", { "space-y-0": !showProgressBar })}>
      <div className="flex justify-between items-center">
        <div
          className={clsx(
            "text-sm font-medium flex items-center",
            computedColorClass,
          )}
        >
          <div
            className={clsx("w-2 h-2 rounded-full mr-2", {
              "bg-red-400 animate-pulse": isOverLimit,
              "bg-current": !isOverLimit,
            })}
          />
          {wordCount}/{limit} words
        </div>

        {isOverLimit && (
          <div className="flex items-center text-red-500 text-xs font-medium animate-[shake_0.5s_ease-in-out]">
            <AlertCircle className="w-3 h-3 mr-1" />
            Keep it under {limit} words
          </div>
        )}
      </div>

      {showProgressBar && (
        <ProgressBar
          wordCount={wordCount}
          isOverLimit={isOverLimit}
          limit={limit}
        />
      )}
    </div>
  );
};

export default WordCountIndicator;
```

---

## Filters (CollapsibleFilters, FilterHeader)

- Path: `src/features/ui/filters/CollapsibleFilters.tsx`

```tsx
"use client";

import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/features/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  toggleLabel?: string;
  clearLabel?: string;
  children: ReactNode;
}

export function CollapsibleFilters({
  isOpen,
  onToggle,
  onClearFilters,
  hasActiveFilters = false,
  toggleLabel = "Filters",
  clearLabel = "Clear Filters",
  children,
}: CollapsibleFiltersProps) {
  return (
    <div className="w-full space-y-4">
      {/* Toggle Button Row */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onToggle}
          variant="outline"
          className={cn(
            "flex items-center gap-2 border-gray-300 text-slate-700 hover:bg-gray-50",
            isOpen && "bg-gray-50 border-gray-400",
          )}
        >
          <Filter className="w-4 h-4" />
          <span>{toggleLabel}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
          )}
        </Button>

        {hasActiveFilters && onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {clearLabel}
          </Button>
        )}
      </div>

      {/* Collapsible Filter Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- Path: `src/features/ui/filters/FilterHeader.tsx`

```tsx
interface FilterHeaderProps {
  title?: string;
  filteredCount?: number;
  totalCount?: number;
  countLabel?: string;
}

export function FilterHeader({
  title = "Filter & Sort",
  filteredCount,
  totalCount,
  countLabel = "types",
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
        {title}
      </h3>
      {filteredCount !== undefined && totalCount !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} {countLabel}
        </span>
      )}
    </div>
  );
}
```

---

## Modal

- Path: `src/features/ui/modal/Modal.tsx`

```tsx
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/features/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "max-w-3xl max-h-[85vh] overflow-y-auto",
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};
```

---

## PropertyCard

- Path: `src/features/ui/property-card/PropertyCard.tsx`

```tsx
interface PropertyCardProps {
  label: string;
  value: string;
  variant?: "slate" | "gray" | "blue" | "green";
}

const variantStyles = {
  slate: {
    gradient:
      "bg-linear-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-700 dark:text-slate-300",
  },
  gray: {
    gradient:
      "bg-linear-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700",
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-700 dark:text-gray-300",
  },
  blue: {
    gradient:
      "bg-linear-to-br from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
  },
  green: {
    gradient:
      "bg-linear-to-br from-green-200 to-green-100 dark:from-green-800 dark:to-green-700",
    border: "border-green-300 dark:border-green-600",
    text: "text-green-700 dark:text-green-300",
  },
};

export const PropertyCard = ({
  label,
  value,
  variant = "slate",
}: PropertyCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex-1 p-4 ${styles.gradient} rounded-xl border ${styles.border} shadow-md`}
    >
      <p
        className={`text-xs ${styles.text} uppercase tracking-wide font-medium`}
      >
        {label}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
};
```

---

## StatusHeader

- Path: `src/features/ui/status-header/StatusHeader.tsx`

```tsx
import { CheckCircleIcon } from "@/theme";
import { ReactNode } from "react";
import clsx from "clsx";

interface StatusHeaderProps {
  title: string;
  icon?: ReactNode;
  variant?: "success" | "info" | "warning" | "error";
  className?: string;
}

const variantStyles = {
  success: {
    icon: "text-green-600 dark:text-green-400",
    title:
      "from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400",
  },
  info: {
    icon: "text-slate-600 dark:text-slate-400",
    title:
      "from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400",
  },
  warning: {
    icon: "text-yellow-600 dark:text-yellow-400",
    title:
      "from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400",
  },
  error: {
    icon: "text-red-600 dark:text-red-400",
    title:
      "from-red-600 via-red-700 to-red-800 dark:from-red-400 dark:via-red-500 dark:to-red-600",
  },
};

export const StatusHeader = ({
  title,
  icon,
  variant = "success",
  className,
}: StatusHeaderProps) => {
  const IconComponent = icon || <CheckCircleIcon className="w-6 h-6" />;
  const styles = variantStyles[variant];

  return (
    <div className={clsx("text-center", className)}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className={styles.icon}>{IconComponent}</span>
        <h3
          className={clsx(
            "text-2xl font-bold bg-linear-to-r bg-clip-text text-transparent",
            styles.title,
          )}
        >
          {title}
        </h3>
        <span className={styles.icon}>{IconComponent}</span>
      </div>
    </div>
  );
};
```

---

## ThemeToggle

- Path: `src/features/ui/theme-toggle/ThemeToggle.tsx`

```tsx
"use client";

import { Button } from "@/features/ui/button";
import { useState, useEffect } from "react";
import { useThemeCycle } from "./useThemeCycle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/features/ui/dropdown-menu";
import clsx from "clsx";

export function ThemeToggle() {
  const { currentTheme, Icon, themes, theme, setTheme } = useThemeCycle();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 px-0"
        disabled
        aria-label="Loading theme"
      >
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 px-0 hover:bg-slate-100 dark:hover:bg-slate-900/20 transition-all duration-200"
          aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
        >
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-all duration-200" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon;
            return (
              <DropdownMenuRadioItem
                key={themeOption.value}
                value={themeOption.value}
                className={clsx("flex items-center gap-2 cursor-pointer", {
                  "text-slate-600 dark:text-slate-400":
                    theme === themeOption.value,
                })}
              >
                <ThemeIcon className="h-4 w-4" />
                {themeOption.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- Path: `src/features/ui/theme-toggle/useThemeCycle.ts`

```tsx
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";

export function useThemeCycle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  // Handle undefined theme during SSR or initial load
  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return {
    themes,
    currentTheme,
    Icon,
    cycleTheme,
    theme: theme || "system",
    setTheme,
  };
}
```
