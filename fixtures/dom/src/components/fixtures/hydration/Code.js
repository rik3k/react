import {findDOMNode} from '../../../find-dom-node';
import PropTypes from 'prop-types';

const React = window.React;

export class CodeEditor extends React.Component {
  static propTypes = {
    code: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return this.props.code !== nextProps.code;
  }

  componentDidMount() {
    this.textareaRef = React.createRef();

    Promise.all([
      import('codemirror'),
      import('codemirror/mode/jsx/jsx'),
      import('codemirror/lib/codemirror.css'),
      import('./codemirror-paraiso-dark.css'),
    ])
    .then(([CodeMirror]) => this.install(CodeMirror))
    .catch(error => {
      console.error('Failed to load CodeMirror:', error);
    });
  }

  install(CodeMirror) {
    if (!this.textareaRef.current) {
      return;
    }

    const {onChange} = this.props;

    this.editor = CodeMirror.fromTextArea(this.textareaRef.current, {
      mode: 'jsx',
      theme: 'paraiso-dark',
      lineNumbers: true,
    });

    if (this.editorChangeHandler) {
      this.editor.off('change', this.editorChangeHandler);
    }

    this.editorChangeHandler = (doc) => {
      onChange(doc.getValue());
    };

    this.editor.on('change', this.editorChangeHandler);
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.off('change', this.editorChangeHandler);
      this.editor.toTextArea();
      this.editor = null;
    }
  }

  render() {
    return (
      <textarea
        ref={this.textareaRef}
        defaultValue={this.props.code}
        autoComplete="off"
        hidden={true}
      />
    );
  }
}

/**
 * Prevent IE9 from raising an error on an unrecognized element:
 * See https://github.com/facebook/react/issues/13610
 */
const supportsDetails = !(
  document.createElement('details') instanceof HTMLUnknownElement
);

export class CodeError extends React.Component {
  render() {
    const {error, className} = this.props;

    if (!error) {
      return null;
    }

    if (supportsDetails) {
      const [summary, ...body] = error.message.split(/\n+/g);

      if (body.length >= 0) {
        return <div className={className}>{summary}</div>;
      }

      return (
        <details className={className}>
          <summary>{summary}</summary>
          {body.join('\n')}
        </details>
      );
    }

    return <div className={className}>{error.message}</div>;
  }
}
