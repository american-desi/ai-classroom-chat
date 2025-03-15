declare module 'prism-react-renderer' {
  import * as React from 'react';

  export type Language =
    | 'markup'
    | 'bash'
    | 'clike'
    | 'c'
    | 'cpp'
    | 'css'
    | 'javascript'
    | 'jsx'
    | 'coffeescript'
    | 'actionscript'
    | 'css-extr'
    | 'diff'
    | 'git'
    | 'go'
    | 'graphql'
    | 'handlebars'
    | 'json'
    | 'less'
    | 'makefile'
    | 'markdown'
    | 'objectivec'
    | 'ocaml'
    | 'python'
    | 'reason'
    | 'sass'
    | 'scss'
    | 'sql'
    | 'stylus'
    | 'tsx'
    | 'typescript'
    | 'wasm'
    | 'yaml';

  export type Token = {
    types: string[];
    content: string;
    empty?: boolean;
  };

  export type PrismTheme = {
    plain: {
      color?: string;
      backgroundColor?: string;
      [key: string]: string | undefined;
    };
    styles: Array<{
      types: string[];
      style: {
        [key: string]: string;
      };
      languages?: Language[];
    }>;
  };

  export type RenderProps = {
    tokens: Token[][];
    className: string;
    style: React.CSSProperties;
    getLineProps: (lineProps: LineInputProps) => LineOutputProps;
    getTokenProps: (tokenProps: TokenInputProps) => TokenOutputProps;
  };

  export type LineInputProps = {
    key?: React.Key;
    style?: React.CSSProperties;
    className?: string;
    line: Token[];
  };

  export type LineOutputProps = {
    key?: React.Key;
    style?: React.CSSProperties;
    className: string;
  };

  export type TokenInputProps = {
    key?: React.Key;
    style?: React.CSSProperties;
    className?: string;
    token: Token;
  };

  export type TokenOutputProps = {
    key?: React.Key;
    style?: React.CSSProperties;
    className: string;
    children: string;
  };

  export type HighlightProps = {
    Prism: any;
    theme?: PrismTheme;
    language: Language;
    code: string;
    children: (props: RenderProps) => React.ReactNode;
  };

  export const defaultProps: {
    Prism: any;
  };

  declare const Highlight: React.FC<HighlightProps>;
  export default Highlight;
}

declare module 'prism-react-renderer/themes/nightOwl' {
  import { PrismTheme } from 'prism-react-renderer';
  declare const theme: PrismTheme;
  export default theme;
} 