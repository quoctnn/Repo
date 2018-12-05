import { Status } from "../types/intrasocial_types";

export interface NestedPageItem
{
    id:number
    children:NestedPageItem[]
    childrenCount:number
    isTemporary:boolean
    community?:number
    status?:Status
}
export class PaginationUtilities {
    
    static getPageItem = (items:{[id:number]:Status}, id, isTemporary:boolean):NestedPageItem => 
    {
        let item = items[id]
        return {
                id:id, 
                children:(item.children_ids || []).map(c => PaginationUtilities.getPageItem(items, c, isTemporary)), 
                isTemporary:isTemporary, 
                community:item.community && item.community.id,
                childrenCount:item.comments_count,
                status:item
                }
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
    static getStatusPageResults = (items:{[id:number]:Status}, ids:number[], isTemporary:boolean):NestedPageItem[]  => { // [{id:1, children:[{id:2, children:[]}]}]
        return ids.map(r => PaginationUtilities.getPageItem(items, r, isTemporary))
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

  