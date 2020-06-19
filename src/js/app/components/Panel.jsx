import React from 'react';
const Panel = props => (
  <div className="panel">
    {props.title && <p className="panel-heading">{props.title}</p>}
    <div className="panel-block">
      <div>{props.children}</div>
    </div>
  </div>
);
export default Panel;
