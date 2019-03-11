import * as React from 'react';
import { nullOrUndefined } from '../../utilities/Utilities';
import classNames from 'classnames';

export interface Props 
{
    onPress?:(event:any) => void
    children?:React.ReactNode
    disabled?:boolean
    className?:string
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
    shouldComponentUpdate = (nextProps:Props) => {
        return nextProps.className != this.props.className ||
                nextProps.disabled != this.props.disabled
    }
    didPressLink = (event) => 
    {
        event.preventDefault()
        this.props.onPress(event)
    }
    render() 
    {
        const renderLink = !nullOrUndefined( this.props.onPress )
        const {className} = this.props
        const cn = classNames("text", className, {link:renderLink})
        const link = renderLink ? this.didPressLink : undefined
        return (
            <span className={cn} onClick={link}>
                {this.props.children}
            </span>
        );
    }
}