import React from 'react';

const Stage = React.forwardRef(({className, ...props}, ref) => (
  <canvas className={className + ' is-fullview'} {...props} ref={ref} />
));

export default Stage;
