import * as React from "react";
import * as ReactDOM from "react-dom";

import { EditorState } from "draft-js";
import Editor from "draft-js-plugins-editor";
import "draft-js-mention-plugin/lib/plugin.css";
import "draft-js-emoji-plugin/lib/plugin.css";
import createMentionPlugin, {
  defaultSuggestionsFilter
} from "draft-js-mention-plugin";
import createEmojiPlugin from "draft-js-emoji-plugin";
import emojiPositionSuggestions from "./emojiPositionSuggestion";
import {defaultTheme} from 'draft-js-emoji-plugin'
require("./MentionEditor.scss");


let theme = {...defaultTheme, emojiSelectPopover:"emojiSelectPopover " + defaultTheme.emojiSelectPopover}
const emojiPlugin = createEmojiPlugin({
  positionSuggestions: emojiPositionSuggestions,
  useNativeArt: true,
  theme:theme
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
export class Mention {
  name: string;
  key: string;
  avatar: string;
  id: number;
  constructor(name: string, key: string, avatar: string, id: number) {
    this.name = name;
    this.avatar = avatar;
    this.key = key;
    this.id = id;
  }
}
interface EntryProps {
  mention: Mention;
  searchValue: string;
  isFocused: boolean;
}
const Entry = (props: EntryProps) => {
  const {
    mention,
    searchValue, // eslint-disable-line no-unused-vars
    isFocused, // eslint-disable-line no-unused-vars
    ...parentProps
  } = props;

  return (
    <div {...parentProps}>
      <div className="mentionSuggestionsEntryContainer">
        <div className="mentionSuggestionsEntryContainerLeft">
          <img
            src={mention.avatar}
            className="mentionSuggestionsEntryAvatar"
            role="presentation"
          />
        </div>

        <div className="mentionSuggestionsEntryContainerRight">
          <div className="mentionSuggestionsEntryText">{mention.name}</div>

          <div className="mentionSuggestionsEntryTitle">{mention.key}</div>
        </div>
      </div>
    </div>
  );
};

const positionSuggestions = ({ state, props }) => {
  let transform;
  let transition;

  if (state.isActive && props.suggestions.length > 0) {
    transform = "scaleY(1)";
    transition = "all 0.25s cubic-bezier(.3,1.2,.2,1)";
  } else if (state.isActive) {
    transform = "scaleY(0)";
    transition = "all 0.25s cubic-bezier(.3,1,.2,1)";
  }

  return {
    transform,
    transition,
    position: "relative",
    padding: "0",
    boxShadow: "none",
    margin: "0.5rem 0.5rem -0.5rem -0.5rem",
    marginBottom: "-0.375rem",

    maxWidth: "initial",
    maxHeight: "150px",
    overflowY: "auto"
  };
};

interface Props {
  mentions: Mention[];
  editorState: EditorState;
  onChange?: (editorState: EditorState) => void;
  filesAdded?:(files:File[]) => void
}
interface State {
  suggestions: Mention[]
  emojiSelectOpen: boolean
  search:string
}

export default class MentionEditor extends React.Component<Props, {}> {
  mentionPlugin: any;
  editor = React.createRef<Editor>();
  state: State;
  rootElement: any;
  positioningElement: any;
  observer:MutationObserver
  private emojiButton = React.createRef<HTMLButtonElement>();
  private container = React.createRef<HTMLDivElement>();
  private fileUploader = React.createRef<HTMLInputElement>();
  constructor(props) {
    super(props);

    this.mentionPlugin = createMentionPlugin({
      positionSuggestions
    });
    this.state = {
      suggestions: [],
      emojiSelectOpen: false,
      search:""
    };
    this.onEmojiButtonMouseUp = this.onEmojiButtonMouseUp.bind(this);
    this.uploadFileChanged = this.uploadFileChanged.bind(this);
    
    this.rootElement = null;
    this.positioningElement = null;
    this.observer = null;
  }
  onChange = (editorState: EditorState) => {
    this.setState({
      editorState
    });
    if (this.props.onChange) {
      this.props.onChange(editorState);
    }
  }
  componentDidUpdate(prevProps:Props)
  {
    if(this.props.mentions != prevProps.mentions)
    {
        this.onSearchChange({value:this.state.search})
    }
  }
  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, this.props.mentions),
      search:value
    });
  }

  onAddMention = mention => {
    // get the mention object selected
    console.log("mention", mention);
  }

  focus = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.editor.current.focus();
  }
  onEmojiButtonMouseUp(e) {
    this.toggleEmojiPanel(e)
  }
  handleRootClick = (e) => 
  {
      this.toggleEmojiPanel(e)
  }
  addBackDrop = () => {
    if (!this.rootElement) {
      var p = document.createElement("div");
      p.className = "emoji-backdrop";
      p.addEventListener("click", this.handleRootClick);
      document.body.appendChild(p);
      this.rootElement = p;

      var posEl = document.createElement("div");
      posEl.className = "context-positioning-element";
      this.positioningElement = posEl;
      document.body.appendChild(this.positioningElement);

      
      this.addObservers();
      this.updatePositioningElementStyle();
      let windowHeight = window.innerHeight;
      let buttonRect = this.emojiButton.current.getBoundingClientRect() as any;
      var bodyRect = document.documentElement.getBoundingClientRect();
      let offset = buttonRect.top + buttonRect.height - bodyRect.top;
      let up = offset > 360 && buttonRect.y >= windowHeight / 2;
      let tranform = up ? "translate(0, calc(-100% - 55px))" : "none";
      ReactDOM.render(
        <div className="emoji-picker-container" style={{ transform: tranform }}>
          <EmojiSelect isOpen={this.state.emojiSelectOpen} />
        </div>,
        this.positioningElement
      );
      this.updatePositioningElementStyle();
    }
  }
  updatePositioningElementStyle = () =>
  {
      if (this.positioningElement)
      {
          let buttonRect = this.emojiButton.current.getBoundingClientRect() as any
          var bodyRect = document.documentElement.getBoundingClientRect()
          let offset = buttonRect.top + buttonRect.height - bodyRect.top
          let top = offset + 10
          let width = buttonRect.x + buttonRect.width
          this.positioningElement.style.top = top + "px"
          this.positioningElement.style.width = width + "px"
          this.positioningElement.style.position = "absolute"
      }
        
  }
  removeBackDrop = () => {
    let el = this.rootElement;
    if (el) {
      this.rootElement = null;
      el.parentNode.removeChild(el);
    }
    el = this.positioningElement;
    if (el) {
      this.positioningElement = null;
      el.parentNode.removeChild(el);
    }
    this.removeObservers();
  }
  addObservers = () => 
  {
      var observer = new MutationObserver(this.observeCallback)
      var config = {childList: true, subtree: true}
      observer.observe(this.container.current, config);
      this.observer = observer
      window.addEventListener("resize", this.observeCallback)
  }
  removeObservers = () => 
  {
      if(this.observer)
      {
          this.observer.disconnect()
          this.observer = null
      }
  }
  observeCallback = (mutations) => 
  {
      this.updatePositioningElementStyle()
  }
  toggleEmojiPanel = (e) =>
  {
    e.preventDefault();
    let visible = !this.state.emojiSelectOpen;
    this.setState({ emojiSelectOpen: visible }, () => {
      if (visible) {
        this.addBackDrop();
      } else {
        this.removeBackDrop();
      }
    })
    
  }
  uploadFileChanged(event)
  {
     let filesList = this.fileUploader.current.files
     let files = []
     for (var i = 0; i < filesList.length; i++) 
     {
        let file = filesList.item(i)
        files.push(file)
      }
      this.props.filesAdded(files)
  }
  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [emojiPlugin, this.mentionPlugin];

    return (
      <div ref={this.container} className="mention-editor" onClick={this.focus}>
          <div>
            <div className="d-flex">
              <div className="flex-grow-1 editor-container">
                <div className="">
                    <Editor
                      editorState={this.props.editorState}
                      onChange={this.onChange}
                      plugins={plugins}
                      ref={this.editor}
                    />
                    <EmojiSuggestions />
                </div>
              </div>
              <div className="d-flex align-items-end">
                <button
                  ref={this.emojiButton}
                  className="emojiButton editor-button btn btn-default"
                  onMouseUp={this.onEmojiButtonMouseUp}
                  type="button" >
                  <i className="fas fa-smile fa-lg"></i>
                </button>
                {this.props.filesAdded && <button
                  className="upload-button editor-button btn btn-default"
                  type="button" >
                  <i className="fas fa-paperclip fa-lg"></i>
                  <input ref={this.fileUploader} multiple={true} accept="*" className="form-control" type="file" onChange={this.uploadFileChanged} />
                </button>}
              </div>
          </div>
        </div>
          
        <MentionSuggestions
              onSearchChange={this.onSearchChange}
              suggestions={this.state.suggestions}
              onAddMention={this.onAddMention}
              entryComponent={Entry}
            />
      </div>
    );
  }
}
