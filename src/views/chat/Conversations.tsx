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
    isFetching:boolean,
    items:Conversation[],
    requestNextConversationPage?:(page:number) => void,
    offset:number
}
export interface State {
}
class Conversations extends React.Component<Props, {}> {     
    state:State
    static defaultProps:Props = {
        total:0,
        isFetching:false,
        items:[],
        offset:0
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
        if(this.props.total == 0 || this.props.offset == 0 && !this.props.isFetching)
            this.props.requestNextConversationPage(0)
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching)
            this.props.requestNextConversationPage(this.props.offset)
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
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const offset = items.length
    return {
        isFetching,
        items,
        total,
        offset
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        requestNextConversationPage:(page:number) => {
            dispatch(Actions.requestNextConversationPage(page))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Conversations);