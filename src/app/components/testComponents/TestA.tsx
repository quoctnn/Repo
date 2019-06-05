import * as React from "react";
import TestC from './TestC';
import { Link } from "react-router-dom";
export interface Props 
{
}
export default class TestA extends React.Component<Props,{}> {

    testCRef = React.createRef<TestC>()
    constructor(props:Props){
        super(props)
    }
    render() {
        return (
            <div className="test-a">
                TestA
                <TestC ref={this.testCRef} />
                <Link to="/tests/testB">testB</Link>
            </div>
        );
    }
}