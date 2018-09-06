export class PaginationUtilities {
        
    static getCurrentPageNumber = (pagination) => {
        if (pagination) 
            return pagination.currentPage
        return 0
    }
    static getResults = (items, ids ) => {
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

  