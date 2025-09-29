import React from 'react';

type HeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export const H1 = ({ children, className = '' }: HeadingProps) => (
  <h1 className={`text-5xl font-extrabold tracking-tight text-white md:text-6xl ${className}`}>
    {children}
  </h1>
);

export const H2 = ({ children, className = '' }: HeadingProps) => (
  <h2 className={`text-3xl font-bold tracking-tight text-white md:text-4xl ${className}`}>
    {children}
  </h2>
);

export const Paragraph = ({ children, className = '' }: HeadingProps) => (
  <p className={`text-lg text-gray-300 ${className}`}>{children}</p>
);

export default H1;
