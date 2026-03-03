import React from "react";

const ContactInfo: React.FC = () => {
  return (
    <div className="text-center text-sm text-gray-600 font-open-sans-regular">
      <p>Need help? Contact us at</p>
      <a
        href="mailto:support@avante.com"
        className="text-custom-blue hover:text-custom-blue-light"
      >
        support@avante.com
      </a>
    </div>
  );
};

export default ContactInfo;
