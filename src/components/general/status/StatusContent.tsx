import * as React from 'react';
import { Status } from '../../../reducers/statuses';
import { getTextContent } from '../../../utilities/Utilities';
import { ProfileManager } from '../../../main/managers/ProfileManager';
import ContentGallery from '../gallery/ContentGallery';
require("./StatusContent.scss");

export interface Props 
{
    status:Status
    embedLinks:boolean
}
interface State 
{
}
export default class StatusContent extends React.Component<Props, State> 
{     
    constructor(props) {
        super(props)
    }
    shouldComponentUpdate(nextProps:Props, nextState)
    {
        return nextProps.status.id != this.props.status.id || 
        nextProps.status.updated_at != this.props.status.updated_at || 
        nextProps.status.files.length != this.props.status.files.length

    }
    getTextForField(field)
    {
        if (this.props.status.highlights) 
        {
            let v = this.props.status.highlights[field]
            if(v && v.length > 0)
            {
                return v[0]
            }
        }
        return this.props.status[field]
    }

    renderDescription() {
        let text = this.getTextForField("text")
        if (text) {
            return (
                <div className="item-description">
                    <span className="text">
                        {getTextContent(text, ProfileManager.getProfiles(this.props.status.mentions),false)}
                    </span>
                </div>
            )
        }
    }
    render() {
        let links = this.props.status.link ? [this.props.status.link] : []
        return (
            <div className="panel-body status-content primary-text">
                {this.renderDescription()}
                <div className="file-list">
                    <ContentGallery files={this.props.status.files || []} links={links} />
                </div>
            </div>
        )
    }
}