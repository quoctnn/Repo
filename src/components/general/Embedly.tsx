import * as React from "react";
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions" 
import { RootState } from '../../reducers/index';
import { EmbedlyItem } from '../../reducers/embedlyStore';
import { nullOrUndefined } from '../../utilities/Utilities';
import {Dispatch} from 'redux'
require("./Embedly.scss");
export interface OwnProps {
  url: string
}
interface ReduxStateProps 
{
  page:EmbedlyItem
  isLoading:boolean
}
interface ReduxDispatchProps 
{
  requestEmbedlyData:(urls:string[]) => void
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
interface State {
  provider_url: string;
  description: string;
  title: string;
  thumbnail_width: number;
  url: string;
  thumbnail_url: string;
  version: string;
  provider_name: string;
  type: string;
  thumbnail_height: number;
}
class Embedly extends React.Component<Props, State> {
  state: State;
  constructor(props) {
    super(props);
    this.state = {
      provider_url: "",
      description: "",
      title: "",
      thumbnail_width: 1,
      url: "",
      thumbnail_url:
        "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
      version: "",
      provider_name: "",
      type: "",
      thumbnail_height: 1
    };
  }
  componentWillMount() {
    if(!this.props.page && !this.props.isLoading)
        this.props.requestEmbedlyData([this.props.url])
  }
  render() {
    let page = this.props.page
    if(!page || !page.provider_url || page.error_code)
    {
        return (<a href={this.props.url} target="_blank"  data-toggle="tooltip" title={this.props.url}>{this.props.url}</a>)
    }
    if(page.media && page.media.html)
    {
        return <div className="embedly responsive embedly-card" dangerouslySetInnerHTML={{__html: page.media.html}}></div>
    }
    return (
      <a className="embedly embedly-card" href={page.url} target="_blank">
        <div className="embedly__image">
          <img
            className="image"
            src={page.thumbnail_url}
            alt={page.title}
          />
        </div>
        <div className="embedly__text">
          <p className="embedly__title">{page.title}</p>
          <p className="embedly__desc">{page.description}</p>
          <p className="embedly__provider">{page.provider_url}</p>
        </div>
      </a>
    );
  }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
  const page = state.embedlyStore.byId[ownProps.url]
    const isLoading = !nullOrUndefined( state.embedlyStore.queuedIds[ownProps.url] )
    return {
        page,
        isLoading
    };
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
      requestEmbedlyData:(urls:string[]) => {
          dispatch(Actions.requestEmbedlyData(urls))
      }
  }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Embedly);

