import * as React from 'react';
import "./TypingIndicator.scss"
type Props = {

}
export class TypingIndicator extends React.PureComponent<Props, {}> {
    constructor(props:Props) {
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