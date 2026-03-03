import { useCallback, useMemo, useState } from "react";

type Validator<T> = (value: T) => string | undefined;

type Validators<T extends Record<string, unknown>> = {
  [K in keyof T]?: Validator<T[K]>;
};

type FieldErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

type FieldTouched<T extends Record<string, unknown>> = Partial<
  Record<keyof T, boolean>
>;

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: FieldErrors<T>;
  touched: FieldTouched<T>;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  handleBlur: (field: keyof T) => void;
  reset: () => void;
  /** Validates all fields, marks all as touched, and returns whether the form is valid. */
  validate: () => boolean;
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validators?: Validators<T>,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<FieldTouched<T>>({});

  const runValidator = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | undefined => {
      return validators?.[field]?.(value);
    },
    [validators],
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      const error = runValidator(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [runValidator],
  );

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback((): boolean => {
    if (!validators) return true;

    const nextErrors: FieldErrors<T> = {};
    const allTouched: FieldTouched<T> = {};

    for (const field of Object.keys(validators) as (keyof T)[]) {
      allTouched[field] = true;
      const error = runValidator(field, values[field]);
      if (error) nextErrors[field] = error;
    }

    setTouched(allTouched);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [validators, values, runValidator]);

  const isValid = useMemo(() => {
    if (!validators) return true;
    return (Object.keys(validators) as (keyof T)[]).every(
      (field) => !runValidator(field, values[field]),
    );
  }, [validators, values, runValidator]);

  const isDirty = useMemo(
    () =>
      (Object.keys(initialValues) as (keyof T)[]).some(
        (field) => values[field] !== initialValues[field],
      ),
    [initialValues, values],
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setFieldValue,
    handleBlur,
    reset,
    validate,
  };
}
