import * as React from "react";
import { ContextSearchData, SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { SearchBox } from '../../../general/input/contextsearch/SearchBox';
import classnames from 'classnames';
import { EditorState } from 'draft-js';

type State = {
    searchData:ContextSearchData
}

type OwnProps = {
    onSearchQueryChange:(es:EditorState) => void
}

type Props = OwnProps
export default class SearchBar extends React.PureComponent<Props, State> {
    searchTextInput = React.createRef<SearchBox>()
    constructor(props: Props) {
        super(props)
        this.state = {
            searchData: SearcQueryManager.parse("", []),
        }
    }

    editorState = () => {
        return this.searchTextInput.current.editorState()
    }
    applyState = (editorState:EditorState) => {
        this.searchTextInput.current.applyState(editorState)
    }
    onChange = (es:EditorState) => {
    }

    render() {
        const cn = classnames([])
        return <SearchBox id="community_search" className={cn}
                ref={this.searchTextInput}
                {...this.props}
                onChange={this.props.onSearchQueryChange}
                placeholder={"Search"}
                data={this.state.searchData}
                multiline={false}
                useClearButtonWithText={true}
                allowedSearchOptions={[]}
        />
    }
}
