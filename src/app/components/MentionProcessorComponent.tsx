import * as React from 'react';
import {Text} from "./general/Text";
import { translate } from '../localization/AutoIntlProvider';
import { uniqueId, getTextContent, getTextContent2 } from '../utilities/Utilities';
import { IntraSocialUtilities } from '../utilities/IntraSocialUtilities';
import { Settings } from '../utilities/Settings';
type OwnProps = {
    text:string
}
type DefaultProps = {
    truncateLength:number
    linebreakLimit:number
    processHtml:boolean
}
type State = {
    readMoreActive:boolean
}
type Props = OwnProps & DefaultProps
export class MentionProcessorComponent extends React.Component<Props, State> {
    private prefix = uniqueId()
    static defaultProps:DefaultProps = {
        truncateLength:Settings.statusTruncationLength,
        linebreakLimit:Settings.statusLinebreakLimit,
        processHtml:false
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            readMoreActive:false
        }
    }
    renderTextContent = (textContent: JSX.Element[], hasMore:boolean) => {
        return  (<>
                    {textContent}
                    {hasMore && <span>...&nbsp;<Text title={translate("read more")} onPress={this.onReadMore}>{translate("read more")}</Text></span>}
                </>)
    }
    onReadMore = (event:any) => {
        this.setState({readMoreActive:true})
    }
    render()
    {
        const {text, truncateLength, linebreakLimit, processHtml} = this.props
        const truncationLength = this.state.readMoreActive ? 0 : truncateLength
        const descriptionText = processHtml ? text && IntraSocialUtilities.htmlToText(text) : text
        const content = descriptionText && getTextContent(this.prefix, descriptionText, false, truncationLength, linebreakLimit)
        const {textContent, linkCards, hasMore} = content
        return this.renderTextContent(textContent, hasMore)
    }
}