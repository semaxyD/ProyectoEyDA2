import React from "react";
import { Input } from "./input";

const InputWithLabel = ({id, label, error, ...rest })=> {
    return (
      <div className="mb-4 text-left">
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
          {label}
        </label>
        <Input id={id} {...rest} />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
};

export default InputWithLabel;