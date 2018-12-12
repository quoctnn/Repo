import * as React from 'react';
import Text from './Text';
import { History} from 'history'
import { withRouter} from 'react-router-dom'

interface OwnProps 
{
    children?:React.ReactNode
}
interface RouteProps
{
    history:History
    location: any
    match:any
}
type Props = RouteProps & OwnProps
interface State 
{
}
class IntraSocialLink extends React.Component<Props, State> 
{     
    constructor(props:Props)
    {
        super(props)
        this.state = {
            reactionsOpen:false
        }
    }
    onLinkPress = (event) => {
        event.preventDefault()
        
    }
    render() 
    {
        return (
            <Text onPress={this.onLinkPress}>{this.props.children}</Text>
        );
    }
}

export default withRouter(IntraSocialLink);