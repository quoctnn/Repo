import * as React from "react";
export interface Props 
{
}
export default class TestC extends React.Component<Props,{}> {

    constructor(props:Props){
        super(props)
    }
    render() {
        return (
            <div className="test-c">
                TestC
            </div>
        );
    }
}