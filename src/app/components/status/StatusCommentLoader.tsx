import * as React from "react";
import "./StatusCommentLoader.scss"
import classnames from 'classnames';
import { translate } from "../../localization/AutoIntlProvider";
import CircularLoadingSpinner from "../general/CircularLoadingSpinner";
import {Text} from "../general/Text";

interface OwnProps 
{
    className?:string
    isLoading:boolean
    loadMoreComments:(e: any) => void
    loadNewer:boolean
}
type Props = OwnProps
export class StatusCommentLoader extends React.PureComponent<Props, {}> {
    render =  () => 
    {
        const cn = classnames("status-comment-loader", this.props.className)
        const title = this.props.loadNewer ? translate("Show newer") : translate("Show older")
        return ( <div className={cn}>
                    <Text disabled={this.props.isLoading} className="status-comment-loader-content btn btn-link primary-text " onPress={this.props.loadMoreComments} title={title}>
                        <div className="line"></div>
                        <div className="button">
                            {!this.props.isLoading && <i className="fa fa-arrow-down"/>} 
                            {this.props.isLoading && <CircularLoadingSpinner size={16} />} 
                            &nbsp;{title}
                        </div>
                        <div className="line"></div>
                    </Text>
                </div>
        )
    }
}
