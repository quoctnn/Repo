import * as React from 'react';
import { Community, ContextObject } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import { Link } from 'react-router-dom';
import "./DetailsContent.scss"
import { MentionProcessorComponent } from '../MentionProcessorComponent';

type OwnProps = {
    community?:Community
    group?:ContextObject
    description?:string
}
type State = {
}
type Props = OwnProps
export class DetailsContent extends React.Component<Props, State> {
    static defaultProps:OwnProps = {
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        const description = this.props.description
        return (
            <div className="details-content">
                { this.props.community &&
                    <div className="text-truncate">
                        <div className="details-field-name">{translate("common.core.community")}</div>
                        <div title={this.props.community.name} className="details-field-value"><Link to={this.props.community.uri}>{this.props.community.name}</Link></div>
                    </div>
                }
                {this.props.group && 
                    <div className="text-truncate">
                        <div className="details-field-name">{translate("common.group.group")}</div>
                        <div title={this.props.group.name} className="details-field-value"><Link to={this.props.group.uri}>{this.props.group.name}</Link></div>
                    </div>
                }
                {this.props.children}
                { description &&
                    <div className="details-description">
                        <MentionProcessorComponent text={description} processHtml={true} />
                    </div>
                }
            </div>
        )
    }
}