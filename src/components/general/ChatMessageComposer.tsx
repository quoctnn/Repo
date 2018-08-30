
import * as React from "react";
import { ProtectNavigation } from '../../utilities/Utilities';
require("./ChatMessageComposer.scss");
export interface Props
{
    onSubmit:(text:string) => void,
    onDidType:() => void
}
interface State
{
    text:string
}
export class ChatMessageComposer extends React.Component<Props,{}> {
    state:State
    throttleTime = 200
    canPublish = true
    private inputRef = React.createRef<HTMLInputElement>()
    constructor(props) {
        super(props)
        this.state = {text: ''}
        this.handleTextChange = this.handleTextChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.fixFoucusInput = this.fixFoucusInput.bind(this)
        this.sendDidType = this.sendDidType.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.text != nextState.text
    }

    handleTextChange(e) {
        ProtectNavigation(e.target.value != "");
        this.setState({text: e.target.value}, this.sendDidType)
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.state.text.length > 0) {
            this.props.onSubmit(this.state.text)
            this.setState({text: ''})
            ProtectNavigation(false);
        }
        return false
    }
    sendDidType()
    {
        if(this.canPublish) 
        {
            this.props.onDidType()
            this.canPublish = false
            setTimeout(() => {
              this.canPublish = true
            }, this.throttleTime)
        }
    }
    fixFoucusInput() {
        // For mobile devices that doesn't show soft keyboard
        this.inputRef.current.click;
    }

    render() {
        return (
            <div className="chat-message-composer">
                <form className="clearfix" action="." onSubmit={this.handleSubmit}>
                    <div className="input-group">
                        <div className="input-wrap"
                            onFocus={this.fixFoucusInput}>
                            <input id="message-input"
                                ref={this.inputRef}
                                type="text" value={this.state.text}
                                onChange={this.handleTextChange}
                                autoComplete="off"
                                maxLength={2048}
                                className="form-control"/>
                        </div>
                        <div className="button-wrap">
                            <button className="btn btn-submit btn-default">
                                Send
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}