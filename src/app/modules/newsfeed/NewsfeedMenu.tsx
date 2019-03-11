import * as React from "react";
import { ContextFilter, ContextValue } from "../../components/general/input/ContextFilter";
import { translate } from "../../localization/AutoIntlProvider";
import { Label, Input, FormGroup } from 'reactstrap';

type Props = 
{
    selectedContext:ContextValue
    includeSubContext:boolean
    onUpdate:(data:NewsfeedMenuData) => void
}
type State = {
    selectedContext:ContextValue
    includeSubContext:boolean
}
export type NewsfeedMenuData = {
    selectedContext:ContextValue
    includeSubContext:boolean
}
export default class NewsfeedMenu extends React.Component<Props, State> {
    
    constructor(props:Props) {
        super(props);
        this.state = {
            selectedContext: this.props.selectedContext,
            includeSubContext:this.props.includeSubContext,
        }
    }
    onContextChange = (context:ContextValue) => {
        this.setState({selectedContext:context}, this.sendUpdate)
    }
    includeSubContextChanged = (event:any) => {
        this.setState({includeSubContext:event.target.checked}, this.sendUpdate)
    }
    sendUpdate = () => {
        this.props.onUpdate({selectedContext:this.state.selectedContext, includeSubContext:this.state.includeSubContext})
    }
    render() {
        return(
            <div className="newsfeed-menu">
                <FormGroup>
                    <Label>{translate("FeedContext")}</Label>
                    <ContextFilter onValueChange={this.onContextChange} value={this.state.selectedContext} />
                </FormGroup>
                <FormGroup check={true}>
                    <Label check={true}>
                        <Input type="checkbox" onChange={this.includeSubContextChanged} checked={this.state.includeSubContext} />{" " + translate("IncludeSubContext")}
                    </Label>
                </FormGroup>
            </div>
        );
    }
}
