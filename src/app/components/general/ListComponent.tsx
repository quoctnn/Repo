import * as React from 'react'
import classnames from "classnames"
import "./ListComponent.scss"
import { PaginationResult } from '../../network/ApiClient';
import { List } from '../../components/general/List';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props<T> = {
    className?:string
    onLoadingStateChanged?:(isLoading:boolean) => void
    scrollParent?:any
    fetchData:(offset:number, completion:(items:PaginationResult<T>) => void) => void
    renderItem:(item:T) => React.ReactNode
    reloadContext?:string
}
type State<T> = {
    items:T[]
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    requestId:number
}
interface IdentifiableObject {
    id: number
}
export default class ListComponent<T extends IdentifiableObject> extends React.Component<Props<T>, State<T>> {  
    constructor(props:Props<T>) {
        super(props);
        this.state = {
            isLoading:false,
            isRefreshing:false,
            items:[],
            hasMore:true,
            requestId:0,
        }
    }
    getItemById = (id:number) => {
        return this.state.items.find(t => t.id == id)
    }
    updateItem = (item:T) => {
        const index = this.state.items.findIndex(t => t.id == item.id)
        let stateItems = this.state.items
        stateItems[index!] = item
        this.setState({items:stateItems})
    }
    reload = () => {
        this.setState(prevState => ({
            isRefreshing: true,
            isLoading: true,
            items:[],
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    componentDidMount = () => 
    {
        if(this.props.scrollParent)
        {
            this.props.scrollParent.addEventListener("scroll", this.onScroll)
        }
        this.setState(prevState => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    componentDidUpdate = (prevProps:Props<T>, prevState:State<T>) => {
        if(prevProps.reloadContext != this.props.reloadContext)
        {
            this.setState(prevState => ({
                isRefreshing: true,
                isLoading: true,
                items:[],
                requestId:prevState.requestId + 1
            }), this.loadData)
        }
        if(this.props.onLoadingStateChanged && prevState.isLoading != this.state.isLoading)
        {
            this.props.onLoadingStateChanged(this.state.isLoading)
        }
    }
    onScroll = (event:any) =>
    {
        let isAtBottom = false
        if(event.target instanceof Document)
            isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight
        else 
            isAtBottom = event.target.scrollTop + event.target.offsetHeight >= event.target.scrollHeight
        if(isAtBottom)
        {
            this.handleLoadMore()
        }
    }
    handleLoadMore = () => 
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState(prevState => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    loadData = () => 
    {

        const { items } = this.state
        const offset = items.length
        const requestId = this.state.requestId
        this.props.fetchData(offset, (data) => {
            if(data && data.results)
            {
                let newData = data.results
                if(requestId == this.state.requestId)
                {
                    this.setState({
                        items: offset == 0 ?  newData :  [...items, ...newData],
                        isRefreshing: false,
                        hasMore:data.next != null,
                        isLoading:false
                    });
                }
            }
        })
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<LoadingSpinner key="loading"/>)
        }
        return null
    }
    renderItems = () => {
        const cn = classnames("list-component-list vertical-scroll")
        const scroll = this.props.scrollParent ? undefined : this.onScroll
        const items = this.state.items.map(i => {
                            return this.props.renderItem(i)
                        }).concat(this.renderLoading())
        return (<List enableAnimation={false} 
                    onScroll={scroll} 
                    className={cn}>
                    {items}
                </List>)
        
    }
    render()
    {
        const cn = classnames("list-component")
        return (<div className={cn}>
                {this.renderItems()}
                </div>)
    }
}