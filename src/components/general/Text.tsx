import * as React from 'react';
import { nullOrUndefined } from '../../utilities/Utilities';
import classNames from 'classnames';

export interface Props 
{
    onPress?:(event:any) => void
    children?:React.ReactNode
}
interface State 
{
}
export default class Text extends React.Component<Props, State> 
{     
    constructor(props:Props)
    {
        super(props)
        this.state = {
            reactionsOpen:false
        }
    }
    didPressLink = (event) => 
    {
        event.preventDefault()
        this.props.onPress(event)
    }
    render() 
    {
        const renderLink = !nullOrUndefined( this.props.onPress )
        const cn = classNames("text", {link:renderLink})
        const link = renderLink ? this.didPressLink : undefined
        return (
            <span className={cn} onClick={link}>
                {this.props.children}
            </span>
        );
    }
}