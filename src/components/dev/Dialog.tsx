
import * as React from 'react';
import * as ReactDOM from "react-dom";
require("./Dialog.scss");

interface OwnProps 
{
    visible:boolean
    children:React.ReactElement<any>
}
interface State 
{
}
type Props = OwnProps
export class Dialog extends React.Component<Props, State> 
{
    private container:HTMLDivElement|undefined
    private ref:any
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount()
    {
        this.container = document.createElement("div")
        document.body.appendChild(this.container)
    }
    componentWillUnmount() 
    {
        if(this.container)
        {
            this.container.parentNode.removeChild(this.container)
            this.container = null
        }
    }
    closeDialog()
    {
        if(this.container)
        {
            while (this.container.firstChild) 
            {
                    this.container.removeChild(this.container.firstChild)
            }

        }
    }
    renderModal() {
        ReactDOM.render( this.props.children, this.container);
    }
    render()
    {
        return null
    }
}