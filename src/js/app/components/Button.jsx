import React from 'react';
import withBulma from '../decorators/withBulma';

const Button = ({children, className, ...restProps}) => (
  <button className={'button ' + className} {...restProps}>
    {children}
  </button>
);

export default withBulma('labeled-field')(Button);
