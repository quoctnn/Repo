import * as React from 'react';
import classNames from "classnames";
import { nullOrUndefined } from '../../../../utilities/Utilities';
import { Avatar } from '../../Avatar';
export class AutocompleteSection 
{
    type:string
    name:string
    items:AutocompleteSectionItem[]
    removable:boolean
    hideWhenEmpty:boolean
    constructor(type:string, name:string, items:AutocompleteSectionItem[], removable:boolean, hideWhenEmpty:boolean)
    {
        this.type = type
        this.name = name
        this.items = items
        this.removable = removable
        this.hideWhenEmpty = hideWhenEmpty
    }
}
export class AutocompleteSectionItem 
{
    id:string
    slug:string
    title:string
    subtitle:string
    count:number
    icon:string
    type:string
    avatar:string
    onItemSelect:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void
    onItemRemove:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void
    constructor(id:string, slug:string, title:string, subtitle:string, count:number, icon:string, type:string, avatar:string, onItemSelect?:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void, onItemRemove?:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void)
    {
        this.id = id
        this.slug = slug
        this.title = title
        this.subtitle = subtitle
        this.count = count
        this.icon = icon
        this.type = type
        this.avatar = avatar
        this.onItemSelect = onItemSelect
        this.onItemRemove = onItemRemove
    }
}

type OwnProps = {
    sections:AutocompleteSection[]
    onClose?:(event:any) => void
    onMouseDown?:(event:any) => void
    style?: React.CSSProperties
    emptyContent?:React.ReactNode
}
type DefaultProps = {
    limit: number
}
type State = {
    cursor:number
}
type Props = OwnProps & DefaultProps
export default class Autocomplete extends React.Component<Props, State> {
    component = React.createRef<HTMLDivElement>()
    static defaultProps:DefaultProps = {
        limit:15
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
    handleItemClick = (item:AutocompleteSectionItem, event:any) => {
        if(!item)
            return
        event.preventDefault()
        event.stopPropagation()
        if(item.onItemSelect)
        {
            item.onItemSelect(event, item)
            this.setState({cursor:-1})
            return
        }
        this.setState({cursor:-1})
    }
    getSuggestionsCount = () => {
        return this.props.sections.map((s) => s.items).reduce((prev, curr) => prev.concat(curr)).length
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
        var count = 0
        for (let i = 0; i < this.props.sections.length; i++) 
        {
            for (let j = 0; j < this.props.sections[i].items.length; j++) 
            {
                if(count == index)
                    return this.props.sections[i].items[j]
                count += 1
            }
        }
        return null
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
    onItemRemove = (item:AutocompleteSectionItem) => (event) => {
        item.onItemRemove(event, item)
    }
    onItemSelect = (item:AutocompleteSectionItem) => (event) => {
        item.onItemSelect(event, item)
    }
    render = () => {
        const cursor = this.state.cursor
        var count = -1
        const c:number = 0
        const isEmpty = this.props.sections.reduce((a, b) => a += b.items.length , c) == 0
        return (<div ref={this.component}  
                    className="autocomplete-component" 
                    style={this.props.style} 
                    onTouchStart={this.onListMouseDown} 
                    onMouseDown={this.onListMouseDown} 
                    onMouseLeave={this.onComponentMouseLeave}
                    >
                    {isEmpty && <div className="no-options">{this.props.emptyContent}</div>}
                    {!isEmpty && <ul className="list" >
                    {this.props.sections.map((section, index) => 
                    {
                        if(section.hideWhenEmpty)
                        {
                            let isEmpty = section.items.length == 0
                            if(isEmpty)
                            {
                                return null
                            }
                        }
                        let header = <li key={section.name} className="list-item section-title">{section.name}</li>
                        return [header].concat(section.items.map((item, ix) => 
                        {
                            count += 1
                            const hasCounter = item.count != null && item.count > 0
                            const hasSubtitle = !nullOrUndefined(item.subtitle)
                            const cn = classNames("list-item section-list-item", {"active highlight-text":cursor == count,"has-counter":hasCounter, "has-subtitle":hasSubtitle })
                            return (<li onMouseEnter={this.onMouseEnter.bind(this, count)} className={cn} key={item.id + section.type} onClick={this.onItemSelect(item)}>
                                <div className="list-content">
                                    {item.avatar && <Avatar image={item.avatar} size={30} borderWidth={2} borderColor="white" />}
                                    <div className="content-body text-truncate">
                                        {!item.avatar && item.icon && <i className={item.icon}></i>}
                                        {item.title && <span className="text-content text-truncate primary-text">{item.title}</span>}
                                        {hasSubtitle && <span className="text-sub-content text-truncate secondary-text">{item.subtitle}</span>}
                                    </div>

                                    {!!item.onItemRemove && <span className="section-list-item-clear" onClick={this.onItemRemove(item)}>
                                        <i className="fa fa-times-circle searchclear"></i>
                                    </span>}
                                    {hasCounter && <span className="section-list-item-count">{item.count}</span>}
                                </div>
                            </li>)
                        }))
                    })}
                    </ul>}
                </div>)
    }
} 