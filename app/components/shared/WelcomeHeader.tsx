import React from "react";

interface WelcomeHeaderProps {
  title: string;
  description: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="text-center max-w-2xl">
      <h1 className="text-3xl font-open-sans-bold text-custom-blue mb-4">
        {title}
      </h1>
      <p className="text-gray-600 font-open-sans-regular">{description}</p>
    </div>
  );
};

export default WelcomeHeader;
