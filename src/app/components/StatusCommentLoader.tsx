import * as React from "react";
import "./StatusCommentLoader.scss"
import classnames from 'classnames';
import { translate } from "../localization/AutoIntlProvider";
import CircularLoadingSpinner from "./general/CircularLoadingSpinner";
import Text from "./general/Text";

interface OwnProps 
{
    className?:string
    color:string
    isLoading:boolean
    loadMoreComments:(e: any) => void
}
type Props = OwnProps
export class StatusCommentLoader extends React.Component<Props, {}> {
    render =  () => 
    {
        const cn = classnames("btn btn-link primary-text status-comment-loader", this.props.color)
        return ( <div>
                    <Text disabled={this.props.isLoading} className={cn} onPress={this.props.loadMoreComments}>
                        <div className="line"></div>
                        <div className="button">
                            {!this.props.isLoading && <i className="fa fa-arrow-down"/>} 
                            {this.props.isLoading && <CircularLoadingSpinner size={16} />} 
                            &nbsp;{translate("Show previous")}
                        </div>
                        <div className="line"></div>
                    </Text>
                </div>
        )
    }
}
