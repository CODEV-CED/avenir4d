'use client';

import React from 'react';

type H1Props = React.HTMLAttributes<HTMLHeadingElement>;

export function H1(props: H1Props) {
  return (
    <h1
      {...props}
      className={`text-4xl font-extrabold tracking-tight text-white md:text-5xl ${props.className ?? ''}`}
    />
  );
}

export default H1;
