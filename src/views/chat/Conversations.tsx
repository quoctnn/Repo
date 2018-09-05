import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import ApiClient from '../../network/ApiClient';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { Button } from 'reactstrap';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootReducer } from '../../reducers';
import { Conversation } from '../../reducers/conversationStore';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
export interface Props {
    pageSize?:number,
    conversationData:number[],
    setConversations:( conversations:Conversation[], total:number) => void,
    appendConversations:( conversations:Conversation[]) => void,
    conversationStore:Conversation[],
    total:number
}
export interface State {
    loading:boolean,
    data:Conversation[],
    offset:number,
    hasLoaded:boolean,
    hash:number
}
class Conversations extends React.Component<Props, {}> {
    state:State
    static defaultProps:Props = {
        pageSize:3,
        total:0,
        conversationData:[],
        setConversations:null,
        appendConversations:null,
        conversationStore:[]
        
    }
    constructor(props) {
        super(props);
        this.state = {
            loading:false, 
            data:[],
            offset:0,
            hasLoaded:false,
            hash:-1
        }
        this.responseFromServer = this.responseFromServer.bind(this)
        this.checkUpdate = this.checkUpdate.bind(this)
        this.loadFromServer = this.loadFromServer.bind(this)
        this.renderLoadMore = this.renderLoadMore.bind(this)
    }
    //load current data
    //load new data 
        // check if newer?
        // if newer?
            //reload 
    
    componentWillMount()
    {
        this.resetConversationCache()
    }
    resetConversationCache()
    {
        this.props.setConversations([], 0)
    }
    componentDidMount()
    {
        this.loadFromServer()//load first page
    }
    componentDidUpdate(prevProps:Props, prevState:State)
    {
        this.checkUpdate()
    }
    
    checkUpdate()
    {
        let result:Conversation[] = []
        let prevHash = this.state.hash
        this.props.conversationData.forEach((id) => 
        {
            let f = this.props.conversationStore.find( i => i.id == id)
            if(f)
                result.push(f)
        })
        let hash = (result.map(i => i.updated_at).join(",") || "0").hashCode()
        if(prevHash != hash)
        {
            console.log("Loading new conversations", result.length)
            this.setState({ data: result, offset: result.length, hash:hash})
        }
    }
    responseFromServer(data:any, status:string, error:string)
    {
        if(error || status == "error" || !data.results)
        {
            toast.error(<ErrorToast message={error || "Error retrieving conversations"} />, { hideProgressBar: true })
            this.setState({loading:false, hasLoaded:false})
            return
        }
        this.setState({loading:false, hasLoaded:true}, () => {
            if(this.state.data && this.state.data.length > 0)
                this.props.appendConversations(data.results)
            else 
                this.props.setConversations(data.results, data.count)
        })
    }
    loadFromServer()
    {
        this.setState({loading:true}, () => {

            console.log("Loading conversations from server","offset:"+ this.state.offset)
            ApiClient.getConversations(this.props.pageSize, this.state.offset, this.responseFromServer)
        })
    }
    renderLoading() {
        if (this.state.loading) {
            return (<li key="loading"><LoadingSpinner/></li>)
        }
    }
    renderLoadMore()
    {
        if(this.state.loading)
            return null
    
        if(this.props.total > this.state.data.length)
        {
            return (<li key="load-more"><Button onClick={() => this.loadFromServer()}>{translate("Load More")}</Button></li>)
        }
        else if(this.state.data.length == 0)
        {
            return (<li>NO CONVERSATIONS AVAILABLE</li>)
        }
    }
    
    render()
    {
        let conversations = this.state.data || []
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
    return {
        conversationData: state.conversationListCache.conversations,
        conversationStore:state.conversationStore.conversations,
        total:state.conversationListCache.total
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setConversations:(conversations:Conversation[], total:number) => {
            dispatch(Actions.setConversationListCache(conversations.map(g => g.id), total))
            dispatch(Actions.storeConversations(conversations))
        },
        appendConversations:(conversations:Conversation[]) => {
            dispatch(Actions.appendConversationListCache(conversations.map(g => g.id)))
            dispatch(Actions.storeConversations(conversations))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Conversations);