import { Status } from '../reducers/statuses';
export interface NestedPageItem
{
    id:number
    children:NestedPageItem[]
}
export class PaginationUtilities {
    
    static getPageItem = (items:Status[], id):NestedPageItem => 
    {
        let item = items[id]
        return {id:id, children:(item.children_ids || []).map(c => PaginationUtilities.getPageItem(items, c))}
    }
    static getCurrentPageNumber = (pagination) => {
        if (pagination) 
            return pagination.currentPage
        return 0
    }
    static getResults = (items, ids:number[] ) => {
        let arr = items || {}
        let values = []
        ids.forEach(k => {
            let o = arr[k]
            if(o)
                values.push(o)
        })
        return values
    }
    static getCurrentPageResults = (items, pagination) => {
        return PaginationUtilities.getResults(items, pagination.ids || [])
    }
    static getStatusPageResults = (items:Status[], pagination):NestedPageItem[]  => { // [{id:1, children:[{id:2, children:[]}]}]
        let rootIds = pagination.ids as number[]
        return rootIds.map(r => PaginationUtilities.getPageItem(items, r))
    }
    static getCurrentCount = (pagination):number => {
        if (pagination) 
            return pagination.totalCount
        return 0
    }
    static calculatePageSize = (elementMinHeight:number):number => 
    {
        return Math.ceil( screen.height * 3 / elementMinHeight / 10) * 10
    }
    static isPageFetching = (pagination) => ( pagination || { fetching: true }).fetching
}

  