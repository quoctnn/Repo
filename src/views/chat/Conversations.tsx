import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootReducer } from '../../reducers';
import { Conversation } from '../../reducers/conversationStore';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined } from '../../utilities/Utilities';
require("./Conversations.scss");
export interface Props {
    total:number,
    isFetching:boolean,
    items:Conversation[],
    requestNextConversationPage?:(page:number) => void,
    offset:number,
    error:string
}

export interface State {
}
class Conversations extends React.Component<Props, {}> {     
    state:State
    static defaultProps:Props = {
        total:0,
        isFetching:false,
        items:[],
        offset:0,
        error:null
    }
    constructor(props) {
        super(props);
        this.state = {

        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
        this.onScroll = this.onScroll.bind(this) 
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
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if((this.props.total == 0 || this.props.offset == 0) && !this.props.isFetching && !hasError)
            this.props.requestNextConversationPage(0)
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
            this.props.requestNextConversationPage(this.props.offset)
    }
    renderLoading() {
        if (this.props.isFetching) {
            return (<li key="loading"><LoadingSpinner/></li>)
        }
    }
    onScroll(event:React.UIEvent<HTMLUListElement>)
    {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.loadNextPageData()
        }
    }
    render()
    {
        let conversations = this.props.items
        
        return (<FullPageComponent> 
                    <div id="conversations-view" className="card full-height col-sm">
                        <div className="card-header grey">
                            <span className="text-truncate d-block">{translate("Conversations")}</span>
                        </div>
                        <div className="card-body full-height">
                            <ul onScroll={this.onScroll} className="group-list vertical-scroll">
                                {conversations.map((c, index) => {
                                    return (<ConversationItem key={index} conversation={c} />)
                                }) }
                                {this.renderLoading()}
                            </ul>
                        </div>
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
    const error = pagination.error
    return {
        isFetching,
        items,
        total,
        offset,
        error
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