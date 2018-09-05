export class PaginationUtilities {
        
        
    static getCurrentPage = (pagination) => {
        return pagination.pages && pagination.pages[pagination.currentPage]
    } 
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
        const currentPage = PaginationUtilities.getCurrentPage(pagination)
        return typeof currentPage == 'undefined' ? [] : PaginationUtilities.getResults(items, currentPage.ids)
    }
    
    static getAllResults = (items, pagination) => {
        const currentPage = PaginationUtilities.getCurrentPage(pagination)
        if (typeof currentPage == 'undefined') {
            return []
        }
        let allPagesKeys = Object.keys(pagination.pages)
        let allPagesIds = []
        for (let key of allPagesKeys) {
            if (pagination.pages[key].params == currentPage.params) {
                allPagesIds = allPagesIds.concat(pagination.pages[key].ids)
            }
        }
        return PaginationUtilities.getResults(items, allPagesIds)
    }
    
    static getCurrentTotalResultsCount = (pagination):number => {
        if (pagination) 
            return pagination.totalCount
        return 0
    }
    
    static isCurrentPageFetching = (pagination) => ( PaginationUtilities.getCurrentPage(pagination) || { fetching: true }).fetching
}

  