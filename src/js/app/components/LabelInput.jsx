import React from "react";
import withBulma from '../decorators/withBulma';

@withBulma('label-input')
class LabelInput extends React.Component {
    render() {
        return <input {...this.props} />
    }
}

export default LabelInput;
