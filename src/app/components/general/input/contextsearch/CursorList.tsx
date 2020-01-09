import * as React from 'react';
import classNames from "classnames";
import { nullOrUndefined } from '../../../../utilities/Utilities';
import Pagination from "react-pagination-library";
import "./Pagination.css";
import { number } from 'prop-types';

export class CursorListItem extends React.Component<{children?:React.ReactNode, onSelect:() => void}, {}>
{
    render(){
        return <div className="item">{this.props.children} </div>
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

    //itemssen:JSX.Element[]

    onClose?:(event:any) => void
    onMouseDown?:(event:any) => void
    style?: React.CSSProperties
    emptyContent?:React.ReactNode

    //handleChange:(event:any) => void

    //selectedValue:{}
    
    numvalue: number

}
type DefaultProps = {

    //selectedValue:{}
}

type State = {
    cursor:number
    currentPage: number,
    todosPerPage: number,

    selectedValueHandler:number,

    selectedValue:number
}



type Props = OwnProps & DefaultProps
export default class CursorList extends React.Component<Props, State> {
    component = React.createRef<HTMLDivElement>()
    listRef = React.createRef<HTMLDivElement>()
    static defaultProps:DefaultProps = {
    }
    constructor(props:Props) {
        super(props);


        //selectedValue: number


        this.handleChange = this.handleChange.bind(this);
        
        this.state = {
            cursor:this.getInitialCursor(props),
            currentPage: 1,
            //todosPerPage: 5         
            
            todosPerPage:this.changetoDoPerPage(3),

            selectedValueHandler:null,

            selectedValue: this.props.numvalue,
        }

    }

   /*  handleChange = (event) => {
        if(typeof this.state.selectedValueHandler !== 'undefined'){
            this.state.selectedValueHandler = event.target.value;
        }
    } */


    handleChange(e) {
        this.setState({selectedValue: e.target.value});
      }

    getInitialCursor = (props) => {
        return -1
    }
    componentDidMount = () => {
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
        this.scrollToIndex(cursor)
        this.setState({cursor:cursor})
    }
    scrollToIndex = (index:number) => {
        const el = this.listRef && this.listRef.current
        if(index > -1 && el)
        {
            const child = el.children[index]
            if(child)
            {
                child.scrollIntoView({block: "end", behavior: "smooth"})
            }
        }
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
            if (this.props.onClose) this.props.onClose(e)
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
    changeCurrentPage = (numPage) => {
        this.setState({ cursor: numPage, currentPage: numPage })
    }

    
   /*  changetoDoPerPage = (todosPerPage) => {
        return todosPerPage
    } */


    changetoDoPerPage = (x:number) => {
        return x
    }


    render = () => {

        //const ntodosPerPage = this.state.todosPerPage;

        const pageNumbers = [];
        /* for (let i = 1; i <= Math.ceil( this.props.items.length / this.state.todosPerPage); i++) {
          pageNumbers.push(i);
        } */


        let selectpagingnumber;

        if( this.props.numvalue == null) 
        selectpagingnumber = 3
        else selectpagingnumber = this.props.numvalue

        for (let i = 1; i <= Math.ceil( this.props.items.length / selectpagingnumber); i++) {
            pageNumbers.push(i);
        } 

        const cursor = this.state.cursor
        return (<div ref={this.component}
                    className="autocomplete-component"                                                           
                    style={this.props.style}
                    onTouchStart={this.onListMouseDown}                                                                                                                                                                                                                                                                                              
                    onMouseDown={this.onListMouseDown}
                    onMouseLeave={this.onComponentMouseLeave}
                    >
                   <Pagination
                    currentPage={pageNumbers[this.state.cursor]}
                    showNext = {true}
                    showPrevious = {true}
                    showLast 
                    totalPages={pageNumbers.length}
                    showFirst
                    changeCurrentPage={this.changeCurrentPage}
                    theme="square-fill"    
                    />         
                    {          
                        <div className="list" ref={this.listRef}>
                        {    
                        this.props.items.map((item, index) => {
                            if(item.type === cursorListItemComparer.type)
                            {

                                const cn = classNames("cursor-list-item", {"active":cursor == index})
                                //const indexOfLastTodo = this.state.currentPage * this.state.todosPerPage;
                                //const indexOfFirstTodo = indexOfLastTodo - this.state.todosPerPage;

                                //const x = this.changetoDoPerPage;
                                const indexOfLastTodo = this.state.currentPage * this.props.numvalue;
                                const indexOfFirstTodo = indexOfLastTodo - this.props.numvalue;

                              //  {this.props.greeting}

                                const currentTodos = this.props.items.slice(indexOfFirstTodo, indexOfLastTodo);                               
                                return <div onMouseEnter={this.onMouseEnter.bind(this, index)} className={cn} key={index} onClick={this.onItemSelect(currentTodos[index])}>
                                {currentTodos[index]}  
                            </div>
                            }
                        })}
                     </div>}
                </div>)
    }
}