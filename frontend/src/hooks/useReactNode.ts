import React from 'react';

export function asReactNode(element: React.ReactElement): React.ReactNode {
  return element as unknown as React.ReactNode;
}

export function asReactElement(node: React.ReactNode): React.ReactElement {
  return node as unknown as React.ReactElement;
}

export function useReactNode() {
  return {
    asReactNode,
    asReactElement,
  };
} 