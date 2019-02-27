import * as React from "react";
import { uniqueId } from "../../utilities/Utilities";
import "./FullPageComponent.scss"
export interface Props {
}

export class FullPageComponent extends React.PureComponent<Props,{}> {

    static fullPage = "full-page-"
    bodyClassAdded = false
    className = FullPageComponent.fullPage + uniqueId()
    componentWillUnmount()
    {
        if(this.bodyClassAdded)
            document.body.classList.remove(this.className)
    }
    componentWillUpdate()
    {
        if(!this.bodyClassAdded && !document.body.classList.contains(this.className))
        {
            this.bodyClassAdded = true
            document.body.classList.add(this.className)
        }
    }
    componentWillMount()
    {
        if(!document.body.classList.contains(this.className))
        {
            this.bodyClassAdded = true
            document.body.classList.add(this.className)
        }
    }
    render()
    {
        return (
        <>
            {this.props.children}
        </>)
    }
}
