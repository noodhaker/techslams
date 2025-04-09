
import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "@/components/ui/button";

interface ButtonProps extends ShadcnButtonProps {}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <ShadcnButton {...props}>{children}</ShadcnButton>;
};

export default Button;
