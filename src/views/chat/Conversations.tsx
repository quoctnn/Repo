import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { Button } from 'reactstrap';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootReducer } from '../../reducers';
import { Conversation } from '../../reducers/conversationStore';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
export interface Props {
    total:number,
    page:number,
    isFetching:boolean,
    items:Conversation[],
    requestConversationPage?:(page:number) => void
}
export interface State {
}
class Conversations extends React.Component<Props, {}> {     
    state:State
    static defaultProps:Props = {
        total:0,
        isFetching:false,
        page:-1,
        items:[]
    }
    constructor(props) {
        super(props);
        this.state = {

        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.renderLoadMore = this.renderLoadMore.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
    }
    componentWillMount()
    {
        this.loadFirstData()
    }
    componentDidMount()
    {
    }
    componentDidUpdate(prevProps:Props, prevState:State)
    {
    }
    loadFirstData()
    {
        if(this.props.total == 0 || this.props.page == -1)
            this.props.requestConversationPage(0)
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.items.length)
            this.props.requestConversationPage(this.props.page + 1)
    }
    renderLoading() {
        if (this.props.isFetching) {
            return (<li key="loading"><LoadingSpinner/></li>)
        }
    }
    renderLoadMore()
    {
        if(this.props.isFetching)
            return null
    
        if(this.props.total > this.props.items.length)
        {
            return (<li key="load-more"><Button onClick={() => this.loadNextPageData()}>{translate("Load More")}</Button></li>)
        }
        else if(this.props.items.length == 0)
        {
            return (<li>NO CONVERSATIONS AVAILABLE</li>)
        }
    }
    
    render()
    {
        let conversations = this.props.items
        
        return (<FullPageComponent> 
                    <div id="conversations-view" className="full-height col-sm">
                    <h3><span className="text-truncate d-block">{translate("Conversations")}</span></h3>
                    <ul className="group-list vertical-scroll">
                        {conversations.map((c, index) => {
                            return (<ConversationItem key={index} conversation={c} />)
                        }) }
                        {this.renderLoadMore()}
                        {this.renderLoading()}
                    </ul>
                    </div>
                </FullPageComponent>)
    }
}

const mapStateToProps = (state:RootReducer) => {
    const pagination = state.conversations.pagination
    const allItems = state.conversations.items
    const isFetching = PaginationUtilities.isCurrentPageFetching(pagination)
    const items = PaginationUtilities.getAllResults(allItems , pagination)
    const currentPageResults = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const page = currentPageResults.length > 0 ? PaginationUtilities.getCurrentPageNumber(pagination) : -1
    const total = PaginationUtilities.getCurrentTotalResultsCount(pagination)
    return {
        page,
        isFetching,
        items,
        total
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        requestConversationPage:(page:number) => {
            dispatch(Actions.requestConversationPage(page))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Conversations);