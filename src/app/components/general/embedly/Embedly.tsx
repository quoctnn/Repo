import * as React from "react";
import { connect } from 'react-redux'
import { nullOrUndefined } from '../../../utilities/Utilities';
import { EmbedCardItem } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux/index';
import { embedlyRequestDataAction } from './redux';
import "./Embedly.scss"
import LoadingSpinner from "../../LoadingSpinner";
import Constants from "../../../utilities/Constants";
import { Avatar } from "../Avatar";
import { Settings } from "../../../utilities/Settings";
export interface OwnProps {
    url: string
}
interface ReduxStateProps 
{
    data:EmbedCardItem
    isLoading:boolean
}
interface ReduxDispatchProps 
{
    requestEmbedData:(urls:string[], cardType:LinkCardType) => void
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

export enum LinkCardType {
    embed 
}
interface State {
    cardType:LinkCardType
}
class Embedly extends React.Component<Props, State> {
    state: State;
    constructor(props:Props) {
        super(props);
        this.state = {
            cardType:LinkCardType.embed
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        return nextProps.url != this.props.url || 
                nextProps.isLoading != this.props.isLoading || 
                nextProps.data != this.props.data
    }
    componentWillMount() {
        if(!this.props.data && !this.props.isLoading)
                this.props.requestEmbedData([this.props.url], this.state.cardType)
        
    }
    resolveIcon = (object_type:string) => 
    {
        if(object_type)
        {
            switch(object_type)
            {
                case "project.task" : return "fa fa-tasks avatar"
                case "project.project" : return "fa fa-folder-o avatar"
                default: return null
            }
        }
        return null
    }
    renderCard = (image:string, title:string, subtitle:string, description:string, avatar:string, icon:string) => 
    {
        const bgImage = image || Constants.resolveUrl(Constants.defaultImg.default)()
        return (<div className="card card-horizontal card-highlight anim-transition hover-card drop-shadow">
                    <div className="row">
                        <div className="col-4" style={{padding:0}}>
                            <div className="card-img-container">
                                <span className="bgImage" style={{backgroundImage:"url(" + bgImage + ")"}} />
                            </div>
                        </div>
                        <div className="col-8 card-content" style={{paddingLeft:"8px", paddingRight:"8px"}}>
                            <div className="card-block">
                                <h4 className="card-title text-uppercase text-truncate">
                                {avatar && <Avatar size={24} image={avatar} className="" />}                                
                                {icon && <i className={icon}></i>}
                                <div className="text-truncate">{title}</div>
                                </h4>
                                {subtitle && <p className="card-subtitle font-italic text-muted">{subtitle}</p>}
                                <p className="card-text" dangerouslySetInnerHTML={{__html: description}}></p>
                            </div>
                        </div>
                    </div>
                </div>)
    }
    renderCardData = () => {
        switch(this.state.cardType)
        {
            case LinkCardType.embed:
            {
                const data:EmbedCardItem = this.props.data as any
                if(!data.provider_url || data.error_code || data.type == "error" )
                {
                    return null//(<a href={this.props.url} target="_blank"  data-toggle="tooltip" title={this.props.url}>{this.props.url}</a>)
                }
                if(data.media && data.media.html)
                {
                    return <div className="is-embed-card responsive" dangerouslySetInnerHTML={{__html: data.media.html}}></div>
                }
                const image = data.images && data.images.length > 0 ?  data.images[0].url : undefined
                const title = data.title || ""
                const subtitle = data.subtitle
                const avatar = data.avatar
                const description = data.description || ""
                const icon = !avatar ? this.resolveIcon(data.type) : null
                return this.renderCard(image, title, subtitle, description, avatar, icon)
            }
            default:return null;
        }
    }
    render = () => {
        const title = Settings.renderLinkTitle ? this.props.data && this.props.data.title : undefined
        return (<a href={this.props.url} className="is-embed-card" target="_blank" title={title}>
                {this.props.isLoading && <LoadingSpinner/>}
                {this.props.data && this.renderCardData()}
                </a>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
  const page = state.embedlyStore.byId[ownProps.url]
    const isLoading = !nullOrUndefined( state.embedlyStore.queuedIds[ownProps.url] )
    return {
        data:page,
        isLoading
    };
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
      requestEmbedData:(urls:string[], cardType:LinkCardType) => {
          dispatch(embedlyRequestDataAction(urls, cardType))
      }
  }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Embedly);

