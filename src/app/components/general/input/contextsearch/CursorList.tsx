import * as React from 'react';
import classNames from "classnames";
import { nullOrUndefined } from '../../../../utilities/Utilities';

export class CursorListItem extends React.Component<{children?:React.ReactNode, onSelect:() => void}, {}>
{
    render(){
        return <div className="item">{this.props.children}</div>
    }
}
export class CursorListHeader extends React.Component<{children?:React.ReactNode}, {}>
{
    render(){
        return <div className="header">{this.props.children}</div>
    }
}
const cursorListItemComparer = <CursorListItem onSelect={() => {}}/>
type OwnProps = {
    items:JSX.Element[]
    onClose?:(event:any) => void
    onMouseDown?:(event:any) => void
    style?: React.CSSProperties
    emptyContent?:React.ReactNode
}
type DefaultProps = {
}
type State = {
    cursor:number
}
type Props = OwnProps & DefaultProps
export default class CursorList extends React.Component<Props, State> {
    component = React.createRef<HTMLDivElement>()
    static defaultProps:DefaultProps = {
    }
    constructor(props:Props) {
        super(props);

        this.state = { 
            cursor:this.getInitialCursor(props),
        }
    }
    getInitialCursor = (props) => {
        return -1
    }
    componentWillMount = () => {
        document.addEventListener("keydown", this.onKeyDown)
    }
    componentWillUnmount = () => {
        document.removeEventListener("keydown", this.onKeyDown)
        this.component = null
    }
    handleItemClick = (item:JSX.Element, event:any) => {
        if(!item || item.type != cursorListItemComparer.type)
            return 
        event.preventDefault()
        event.stopPropagation()
        const object = item as any as CursorListItem
        if(object.props.onSelect)
        {
            object.props.onSelect()
            this.setState({cursor:-1})
            return
        }
        this.setState({cursor:-1})
    }
    getSuggestionsCount = () => {
        return this.props.items.filter(n => {
            return n.type === cursorListItemComparer.type
        }).length
    }
    moveCursor = (move:number) => {
        var cursor = this.state.cursor + move
        let maxIndex = Math.max(0, this.getSuggestionsCount() - 1)
        if (cursor < 0)
            cursor = maxIndex
        else if (cursor > maxIndex)
            cursor = 0
        this.setState({cursor:cursor})
    }
    onKeyDown = (e:KeyboardEvent) => {
        if(e.key == "ArrowDown")
        {
            e.preventDefault()
            this.moveCursor(1)
        }
        else if(e.key == "ArrowUp")
        {
            e.preventDefault()
            this.moveCursor(-1)
        }
        else if(e.key == "Escape")
        {
            e.preventDefault()
            this.moveCursor(-1)
            this.props.onClose(e)
        }
        else if(e.key == "Tab")
        {
            this.selectActiveSelection(e)
        }
        else if(e.key == "Enter")
        {
            this.selectActiveSelection(e)
        }
    }
    selectActiveSelection = (event:KeyboardEvent) => {
        const item = this.getSelectedItem()
        this.handleItemClick(item, event)
    }
    hasActiveSelection = () => {
        return !nullOrUndefined( this.getSelectedItem() )
    }
    getSelectedItem = () => {
        let index = this.state.cursor
        if(index > -1 )
            return this.getItemByIndex(index)
        return null
    }
    getItemByIndex = (index:number) => {
        return this.props.items[index]
    }
    onMouseEnter = (index, event:React.SyntheticEvent<any>) => {
        this.setState({cursor:index})
    }
    onComponentMouseLeave = (event:React.SyntheticEvent<any>) => {
        this.setState({cursor:-1})
    }
    onListMouseDown = (e:React.SyntheticEvent<any>) => {
        e.preventDefault()
        if(e.target == this.component.current)
        {
            this.props.onClose(e)
        }
        else 
        {
            if(this.props.onMouseDown)
            {
                this.props.onMouseDown(e)
            }
        }
    }
    onItemSelect = (item:JSX.Element) => (event:any) => {
        this.handleItemClick(item, event)
    }
    render = () => {
        const cursor = this.state.cursor
        return (<div ref={this.component}  
                    className="autocomplete-component" 
                    style={this.props.style} 
                    onTouchStart={this.onListMouseDown} 
                    onMouseDown={this.onListMouseDown} 
                    onMouseLeave={this.onComponentMouseLeave}
                    >
                    {<div className="list">
                        {this.props.items.map((item, index) => {
                            if(item.type === cursorListItemComparer.type)
                            {
                                const cn = classNames("cursor-list-item", {"active":cursor == index})
                                return <div onMouseEnter={this.onMouseEnter.bind(this, index)} className={cn} key={index} onClick={this.onItemSelect(item)}>
                                            {item}
                                        </div>
                            }
                            return item
                        })}
                    </div>}
                </div>)
    }
} 