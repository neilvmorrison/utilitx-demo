import { useState } from "react";

type UseToggleReturn<T> = T extends boolean
  ? [boolean, () => void]
  : [string, () => void];

export default function useToggle<T extends boolean | string[]>(
  initialValue: T,
): UseToggleReturn<T> {
  const [value, setValue] = useState<boolean | string>(
    Array.isArray(initialValue) ? initialValue[0] : initialValue,
  );

  if (typeof initialValue === "boolean") {
    function toggle() {
      setValue((prevVal) => !prevVal);
    }
    return [value, toggle] as UseToggleReturn<T>;
  }

  const arrayValues = initialValue as string[];
  function toggle() {
    setValue((prevVal) => {
      const currentIndex = arrayValues.indexOf(prevVal as string);
      const nextIndex = (currentIndex + 1) % arrayValues.length;
      return arrayValues[nextIndex];
    });
  }
  return [value, toggle] as UseToggleReturn<T>;
}
