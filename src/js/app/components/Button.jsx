import React from 'react';

const Button = ({children, className, ...restProps}) => (
  <button className={'button ' + className} {...restProps}>
    {children}
  </button>
);

export default Button;
