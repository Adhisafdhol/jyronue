import { FC, useLayoutEffect, useRef, useState } from "react";
import styles from "./InputContainer.module.css";
import { checkAutofilled, isInputEmpty } from "../../utils/domUtils";
import { useFormContext } from "react-hook-form";
import { errorValue } from "../../config/formValues";

type InputTypes = "password" | "text";

interface Props {
  form: {
    focus: boolean;
    setFocus: React.Dispatch<React.SetStateAction<boolean>>;
    setError?: React.Dispatch<React.SetStateAction<errorValue | null>>;
  };
  id: string;
  type?: InputTypes;
  autoComplete: string;
  label: string;
  validation: {
    required?: string;
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    pattern?: {
      value: RegExp;
      message: string;
    };
  };
}

const InputContainer: FC<Props> = ({
  id,
  type = "text",
  autoComplete,
  label,
  validation,
  form,
}) => {
  const [input, setInput] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { register } = useFormContext();
  const { required, minLength, maxLength, pattern } = validation;
  const inputRef = useRef(null);
  const [isAutofilled, setIsAutofilled] = useState(false);

  useLayoutEffect(() => {
    // Check for prefilled input on load periodically
    // The time when it's autofilled is not very stable, so check few times
    setTimeout(checkAutofilled.bind(this, inputRef, setIsAutofilled), 0);
    setTimeout(checkAutofilled.bind(this, inputRef, setIsAutofilled), 150);
    setTimeout(checkAutofilled.bind(this, inputRef, setIsAutofilled), 450);
    setTimeout(checkAutofilled.bind(this, inputRef, setIsAutofilled), 600);
  }, []);

  return (
    <div className={styles.inputContainer}>
      <label
        className={
          input || isFocused || form.focus || isAutofilled
            ? styles.hiddenLabel
            : styles.label
        }
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type={type !== "password" ? type : visibility ? "text" : type}
        autoComplete={autoComplete}
        onInput={(e) => {
          setInput(isInputEmpty(e));

          if (form.setError) {
            form.setError(null);
          }
        }}
        {...register(id, {
          required: required,
          minLength: minLength,
          maxLength: maxLength,
          pattern: pattern,
        })}
        onFocus={() => {
          setIsFocused(true);
          form.setFocus(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          form.setFocus(false);
        }}
        name={id}
        placeholder={isFocused || input || form.focus ? label : ""}
        ref={inputRef}
      />
      {type === "password" && input && (
        <button
          type="button"
          className={styles.visibilityBtn}
          onClick={() => setVisibility(!visibility)}
        >
          <span className={visibility ? styles.visible : styles.hidden}></span>
        </button>
      )}
    </div>
  );
};

export default InputContainer;
