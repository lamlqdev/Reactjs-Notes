import React from "react";

interface OutputProps {
  children: React.ReactNode;
}

const Output: React.FC<OutputProps> = (props) => {
  return <h2>{props.children}</h2>;
};

export default Output;

