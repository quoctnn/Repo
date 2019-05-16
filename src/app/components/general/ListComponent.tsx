import * as React from 'react'
import classnames from "classnames"
import "./ListComponent.scss"
import { PaginationResult } from '../../network/ApiClient';
import { List } from '../../components/general/List';
import LoadingSpinner from '../../components/LoadingSpinner';
import { translate } from '../../localization/AutoIntlProvider';
import { IdentifiableObject } from '../../types/intrasocial_types';

class ListComponentDivider extends React.Component{
    render() {
        return (
            <div className="theme-box theme-bg-gradient list-divider"><hr/></div>
        )
    }
}
type Props<T> = {
    className?:string
    onLoadingStateChanged?:(isLoading:boolean) => void
    scrollParent?:any
    fetchData:(offset:number, completion:(items:PaginationResult<T>) => void) => void
    renderItem:(item:T) => React.ReactNode
    renderEmpty?:() => React.ReactNode
    renderError?:() => React.ReactNode
    sortItems?:(items:T[]) => T[]
    reloadContext?:string
    redrawContext?:string
    /** Filter out elements that should not count for offset */
    offsetCountFilter?:(items:T[]) => number
    onDidLoadData?:(offset:number) => void
}
type State<T> = {
    items:T[]
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    requestId:number
    hasReceivedData:boolean
    hasError:boolean
    redrawContext?:string
    dividerPosition?:number
    lastFetchOffset:number
}
export default class ListComponent<T extends IdentifiableObject> extends React.Component<Props<T>, State<T>> {
    private listRef = React.createRef<List>()
    constructor(props:Props<T>) {
        super(props);
        this.state = {
            isLoading:false,
            isRefreshing:false,
            items:[],
            hasMore:true,
            requestId:0,
            hasReceivedData:false,
            hasError:false,
            lastFetchOffset:0
        }
    }
    getItemById = (id:number) => {
        return this.state.items.find(t => t.id == id)
    }
    getItemAtIndex = (index:number) => {
        return this.state.items[index]
    }
    getItemByProperty = (key:string, value:any) => {
        return this.state.items.find(t => t[key] == value)
    }
    updateItem = (item:T) => {
        this.setState((prevState:State<T>) => {
            const index = prevState.items.findIndex(t => t.id == item.id)
            let stateItems = this.state.items
            stateItems[index!] = item
            return {items:stateItems}
        })
    }
    removeItemById = (id:number) => {

        this.setState((prevState:State<T>) => {
            let stateItems = prevState.items
            const index = stateItems.findIndex(t => t.id == id)
            if(index > -1)
            {
                stateItems.splice(index,1)
            }
            return {items:stateItems}
        })
    }
    safeUnshift = (item:T, key?:string) => {
        // Check if item exists (default to id)
        const oldItem = !!key ? this.getItemByProperty(key, item[key]) : this.getItemById(item.id)
        if (oldItem) {
            this.updateItem(item);
        } else {
            this.setState((prevState:State<T>) => {
                const l = prevState.items
                l.unshift(item)
                return {items:l}
            })
        }
    }
    reload = () => {
        this.setState((prevState:State<T>) => ({
            isRefreshing: true,
            isLoading: true,
            items:[],
            requestId:prevState.requestId + 1,
            hasReceivedData:false,
        }), this.loadData)
    }
    componentDidMount = () =>
    {
        if(this.props.scrollParent)
        {
            this.props.scrollParent.addEventListener("scroll", this.onScroll)
        }
        this.setState((prevState:State<T>) => ({ // first load
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    componentDidUpdate = (prevProps:Props<T>, prevState:State<T>) => {
        if(prevProps.reloadContext != this.props.reloadContext)
        {
            this.setState((prevState:State<T>) => ({
                isRefreshing: true,
                isLoading: true,
                items:[],
                requestId:prevState.requestId + 1
            }), this.loadData)
        }
        if(prevProps.redrawContext != this.props.redrawContext)
        {
            this.setState((prevState:State<T>) => {
                return {redrawContext:this.props.redrawContext}
            })
        }
        if(this.props.onLoadingStateChanged && prevState.isLoading != this.state.isLoading)
        {
            this.props.onLoadingStateChanged(this.state.isLoading)
            if(this.props.onDidLoadData && !this.state.isLoading)
            {
                this.props.onDidLoadData(this.state.lastFetchOffset)
            }
        }
    }
    scrollToTop = () => {
        this.listRef.current.scrollToTop()
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
        this.setState((prevState:State<T>) => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    getOffset = () => {

        const { items } = this.state
        if(this.props.offsetCountFilter)
            return this.props.offsetCountFilter(items)
        return items.length
    }
    loadData = () =>
    {
        const offset = this.getOffset()
        const requestId = this.state.requestId
        this.props.fetchData(offset, (data) => {
            if(data && data.results)
            {
                let newData = data.results
                let divider = data.divider
                if (divider == data.count) divider=null
                if(requestId == this.state.requestId)
                {
                    this.setState((prevState:State<T>) => {
                        const items = prevState.items
                        const d = offset == 0 ?  newData :  [...items, ...newData]
                        return {
                            items: d,
                            isRefreshing: false,
                            hasMore:data.next != null,
                            isLoading:false,
                            hasReceivedData:true,
                            hasError:false,
                            dividerPosition: divider,
                            lastFetchOffset:offset
                        }
                    });
                }
            }
            else {
                this.setState((prevState:State<T>) => {
                    return {
                    items: [],
                    isRefreshing: false,
                    hasMore:false,
                    isLoading:false,
                    hasReceivedData:true,
                    hasError:true,
                    lastFetchOffset:0
                }});
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
        const cn = classnames("list-component-list vertical-scroll", this.props.className)
        const scroll = this.props.scrollParent ? undefined : this.onScroll
        const listItems = this.props.sortItems ? this.props.sortItems(this.state.items) : this.state.items
        let items = listItems.map(i => {
                            return this.props.renderItem(i)
                        }).concat(this.renderLoading())
        if (this.state.dividerPosition) items.splice(this.state.dividerPosition, 0, <ListComponentDivider key="divider"/>)
        return (<List ref={this.listRef} enableAnimation={false}
                    onScroll={scroll}
                    className={cn}>
                    {items}
                </List>)

    }
    renderError = () => {
        if(this.state.hasError && !this.state.isLoading && this.state.hasReceivedData)
        {
            if(this.props.renderError)
                return this.props.renderError()
            return <div>{translate("generic.list.error")}</div>
        }
        return null
    }
    renderEmpty = () => {
        if(!this.state.hasError && !this.state.isLoading && this.state.hasReceivedData && this.state.items.length == 0)
        {
            if(this.props.renderEmpty)
                return this.props.renderEmpty()
            return <div>{translate("generic.list.empty")}</div>
        }
        return null
    }
    render()
    {
        const cn = classnames("list-component")
        return (<div className={cn}>
                {this.renderItems()}
                {this.renderEmpty()}
                {this.renderError()}
                </div>)
    }
}