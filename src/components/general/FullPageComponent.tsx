import * as React from "react";

export interface Props {
}
export class FullPageComponent extends React.Component<Props,{}> {

    static fullPage = "full-page"
    bodyClassAdded = false
    componentWillUnmount()
    {
        if(this.bodyClassAdded)
            document.body.classList.remove(FullPageComponent.fullPage)
    }
    componentWillUpdate()
    {
        if(!this.bodyClassAdded && !document.body.classList.contains(FullPageComponent.fullPage))
        {
            this.bodyClassAdded = true
            document.body.classList.add(FullPageComponent.fullPage)
        }
    }
    componentWillMount()
    {
        if(!document.body.classList.contains(FullPageComponent.fullPage))
        {
            this.bodyClassAdded = true
            document.body.classList.add(FullPageComponent.fullPage)
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
