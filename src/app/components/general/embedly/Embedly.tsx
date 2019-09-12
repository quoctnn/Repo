import * as React from "react";
import { connect } from 'react-redux'
import { nullOrUndefined, truncate } from '../../../utilities/Utilities';
import { EmbedCardItem } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux/index';
import { embedlyRequestDataAction } from './redux';
import "./Embedly.scss"
import LoadingSpinner from "../../LoadingSpinner";
import Constants from "../../../utilities/Constants";
import Avatar from "../Avatar";
import { Settings } from "../../../utilities/Settings";
import classnames from 'classnames';
import { Card, CardImg, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import { SecureImage } from "../SecureImage";
import { IntraSocialUtilities } from "../../../utilities/IntraSocialUtilities";
import Link from "../Link";
type OwnProps = {
    url: string
}
type DefaultProps = {
    showMedia:boolean
    verticalCard:boolean
    renderOnError:boolean
}
type ReduxStateProps = {
    data:EmbedCardItem
    isLoading:boolean
    hasError:boolean
}
type ReduxDispatchProps = {
    requestEmbedData:(urls:string[], cardType:LinkCardType) => void
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & DefaultProps

export enum LinkCardType {
    embed 
}
type State = {
    cardType:LinkCardType
}
class Embedly extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        showMedia:false,
        verticalCard:false,
        renderOnError:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            cardType:LinkCardType.embed,
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
    renderVerticalCard  = (image:string, title:string, subtitle:string, description:string, avatar:string, icon:string, url:string) => {
        const bgImage = image || Constants.resolveUrl(Constants.defaultImg.default)()
        const favIcon = avatar || icon
        return (<Card className="hover-card">
                    <CardImg top width="100%" src={bgImage} alt="Card image cap" />
                    <CardBody>
                        <CardTitle className="primary-text title-text">{title}</CardTitle>
                        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
                        <p className="secondary-text medium-text">{description}</p>
                        <div className="d-flex align-items-center">
                            {favIcon && <SecureImage className="mr-1 favicon" url={favIcon} />}
                            <div className="secondary-text text-truncate small-text">{url}</div>
                        </div>
                    </CardBody>
                </Card>)
    }
    renderCard = (image:string, title:string, subtitle:string, description:string, avatar:string, icon:string, url:string) => 
    {
        if(this.props.verticalCard)
        {
            return this.renderVerticalCard(image, title, subtitle, description, avatar, icon, url)
        }
        const bgImage = image || Constants.resolveUrl(Constants.defaultImg.default)()
        const favIcon = avatar || icon
        return (<div className="card card-horizontal card-highlight anim-transition hover-card drop-shadow">
                    <div className="row">
                        <div className="col-4" style={{padding:0}}>
                            <div className="card-img-container">
                                <span className="bgImage" style={{backgroundImage:"url(" + bgImage + ")"}} />
                            </div>
                        </div>
                        <div className="col-8 card-content" style={{paddingLeft:"8px", paddingRight:"8px"}}>
                            <div className="card-block">
                                <CardTitle className="primary-text title-text text-truncate">
                                    {avatar && <Avatar size={24} image={avatar} className="" />}                                
                                    {icon && <i className={icon}></i>}
                                    <div className="text-truncate">{title}</div>
                                </CardTitle>
                                {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
                                <p className="secondary-text medium-text">{description}</p>
                                <div className="d-flex align-items-center">
                                    {favIcon && <SecureImage className="mr-1 favicon" url={favIcon} />}
                                    <div className="secondary-text text-truncate small-text">{url}</div>
                                </div>
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
                if(this.props.hasError)
                {
                    return this.props.url//(<a href={this.props.url} target="_blank"  data-toggle="tooltip" title={this.props.url}>{this.props.url}</a>)
                }
                const data:EmbedCardItem = this.props.data as any
                const image = data.images && data.images.length > 0 ?  data.images[0].url : undefined
                const title = data.title || ""
                const subtitle = data.subtitle
                if(this.props.showMedia && data.media && data.media.html)
                {
                    return <div className="is-embed-card responsive" dangerouslySetInnerHTML={{__html: data.media.html}}></div>
                }
                const avatar = data.avatar
                const description = truncate(IntraSocialUtilities.htmlToText(data.description || ""), 200)
                let icon:string = null
                if(!avatar)
                {
                    icon = this.resolveIcon(data.type) || data.favicon_url
                }
                const url = this.getUrl()
                return this.renderCard(image, title, subtitle, description, avatar, icon, url)
            }
            default:return null;
        }
    }
    getUrl = () => {
        if(this.props.data && this.props.data.provider_url)
        {
            const u = this.props.data.internal ? this.props.data.url : this.props.data.original_url
            return new URL(u, this.props.data.provider_url).href
        }
        return this.props.url
    }
    render = () => {
        if(!this.props.renderOnError && this.props.hasError)
            return null
        const title = Settings.renderLinkTitle ? this.props.data && this.props.data.title : undefined
        const url = this.getUrl()
        const cl = classnames("is-embed-card", {"has-error":this.props.hasError})
        return (<Link to={url} className={cl} title={title}>
                {this.props.isLoading && <LoadingSpinner/>}
                {this.props.data && this.renderCardData()}
                </Link>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    const page = state.embedlyStore.byId[ownProps.url]
    const isLoading = !nullOrUndefined( state.embedlyStore.queuedIds[ownProps.url] )
    return {
        data:page,
        isLoading,
        hasError:(page && (!page.provider_url || !!page.error_code || page.type == "error")) || false
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

