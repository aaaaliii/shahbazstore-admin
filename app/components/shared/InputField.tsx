import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-open-sans-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-custom-blue font-open-sans-regular ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-custom-red font-open-sans-regular">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
