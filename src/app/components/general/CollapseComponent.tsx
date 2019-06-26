import * as React from 'react';
import classNames from 'classnames';
import "./CollapseComponent.scss"
import { uniqueId } from '../../utilities/Utilities';

export enum CollapseState{
    insertContent, opening, open, closing, closed, removeContent
}
type OwnProps = {
    visible:boolean
}
type DefaultProps = {
    animationDuration:number
    removeContentOnCollapsed:boolean
}
type Props = DefaultProps & OwnProps & React.HTMLAttributes<HTMLDivElement>
interface State 
{
    state:CollapseState
    contentVisible:boolean
}
export default class CollapseComponent extends React.PureComponent<Props, State> 
{     
    container = React.createRef<HTMLDivElement>();
    count:number = 0
    id = uniqueId()
    static defaultProps:DefaultProps = {
        animationDuration : 250,
        removeContentOnCollapsed:true
    }
    constructor(props:Props)
    {
        super(props)
        this.state = {
            state:props.visible ? CollapseState.open : CollapseState.removeContent,
            contentVisible:false,
        }
    }
    /*shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        return nextProps.visible != this.props.visible || 
                nextState.contentVisible != this.state.contentVisible || 
                nextState.state != this.state.state

    }*/
    componentWillUnmount = () => {
        this.container = null
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        //open -> sh -> none
        //close -> sh -> 0
        if(this.props.visible != prevProps.visible)
        {
            if(this.props.visible)
            {
                requestAnimationFrame(this.setInsertContent)
                
            }
            else {
                requestAnimationFrame(this.setClosing)
            }
        }
    }
    requestClosing = () => {
        requestAnimationFrame(this.setClosed)
    }
    requestOpening = () => {
        requestAnimationFrame(this.setOpening)
    }
    setOpening = () => {
        this.setState({state:CollapseState.opening}, this.setOpenState)
    }
    setInsertContent = () => {
        this.setState({state:CollapseState.insertContent}, this.requestOpening)
    }
    setClosed = () => {
        this.setState({state:CollapseState.closed}, this.removeContent)
    }
    setClosing = () => {
        this.setState({state:CollapseState.closing}, this.requestClosing)
    }
    removeContent = () => {
        setTimeout(() => {
            this.setState((prevState) => {
                if(prevState.state == CollapseState.closed)
                    return {state: CollapseState.removeContent}
            })
        }, this.props.animationDuration + 100);
    }
    setOpenState = () => {
        setTimeout(() => {
            this.setState((prevState) => {
                if(prevState.state == CollapseState.opening)
                    return {state: CollapseState.open}
            })
        }, this.props.animationDuration + 100);
    }
    maxHeightForState = () => {
        switch(this.state.state)
        {
            case CollapseState.opening: return this.container.current.scrollHeight;
            case CollapseState.open: return "none";
            case CollapseState.closing: return this.container.current.scrollHeight;
            default: return 0;
        }
    }
    log = (text:string) => {
        console.log(this.id, text, this.state.state,  this.count++ )
    }
    render() 
    {
        const {className, visible, children, style, animationDuration,removeContentOnCollapsed, ...rest} = this.props
        const newStyle = style || {}
        newStyle.transition = `max-height ${this.props.animationDuration}ms ease-in-out`
        newStyle.maxHeight = this.maxHeightForState()
        const renderChildren = !removeContentOnCollapsed || this.state.state != CollapseState.removeContent 
        return (
            <div {...rest} ref={this.container} style={newStyle} className={classNames("iw-collapse", `iw-collapse-${status}`, className)} >
                {renderChildren && children}
            </div>
        );
    }
}