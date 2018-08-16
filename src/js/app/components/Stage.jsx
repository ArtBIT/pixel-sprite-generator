import React from 'react';

const Stage = React.forwardRef((props, ref) => (
  <canvas className="is-fullview" {...props} ref={ref} />
));

export default Stage;
