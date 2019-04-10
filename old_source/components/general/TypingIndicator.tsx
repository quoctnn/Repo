import * as React from 'react';
require("./TypingIndicator.scss");
export interface Props
{

}
export class TypingIndicator extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
    }
    render() 
    {
        return(
            <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        );
    }
}