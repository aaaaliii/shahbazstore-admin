import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-open-sans-medium text-sm transition-colors duration-200";
  const variantStyles = {
    primary: "bg-custom-blue text-white hover:bg-custom-blue-light",
    secondary:
      "bg-white text-custom-blue border border-custom-blue hover:bg-gray-50",
  };
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
