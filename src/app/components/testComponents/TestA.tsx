import * as React from "react";
import TestC from './TestC';
import { Link } from "react-router-dom";
import Routes from "../../utilities/Routes";
export interface Props 
{
}
export default class TestA extends React.Component<Props,{}> {

    testCRef = React.createRef<TestC>()
    constructor(props:Props){
        super(props)
    }
    componentWillUnmount = () => {
        this.testCRef = null
    }
    render() {
        return (
            <div className="test-a">
                TestA
                <TestC ref={this.testCRef} />
                <Link to="/tests/testB">testB</Link>
                <Link to={Routes.conversationUrl(null)}>Conversations</Link>
            </div>
        );
    }
}