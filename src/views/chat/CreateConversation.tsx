import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootState } from '../../reducers';
import { Conversation } from '../../reducers/conversations';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined, cloneDictKeys } from '../../utilities/Utilities';
import { addSocketEventListener, SocketMessageType, removeSocketEventListener } from '../../components/general/ChannelEventStream';
import { UserProfile } from '../../reducers/profileStore';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { getProfileById } from '../../main/App';
import { conversationReducerPageSize } from '../../reducers/conversations';
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess()

require("./CreateConversation.scss");
export interface Props {
}
export interface State {
}
class CreateConversation extends React.Component<Props, {}> {     
    state:State
    static defaultProps:Props = {
    }
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        
        return (<div id="create-conversation">
                CreateConversation
                </div>)
    }
}
const mapStateToProps = (state:RootState) => {
    return {
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateConversation);