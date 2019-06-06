import * as React from "react";
import TestC from "./TestC";
import { Link } from "react-router-dom";
export interface Props 
{
}
export default class TestB extends React.Component<Props,{}> {
    testCRef = React.createRef<TestC>()
    constructor(props:Props){
        super(props)
    }
    componentWillUnmount = () => {
        this.testCRef = null
    }
    render() {
        return (
            <div className="test-b">
                TestB 
                <TestC ref={this.testCRef} />
                <Link to="/tests/testA">testA</Link>
            </div>
        );
    }
}