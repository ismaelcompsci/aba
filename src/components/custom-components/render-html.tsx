import { PureComponent } from "react";
import { Linking, Text as RNText, View } from "react-native";
import { Node, NodeWithChildren } from "react-native-render-html";
import { ElementType, parseDocument } from "htmlparser2";
import { Text, TextProps } from "tamagui";

import { Flex } from "../layout/flex";

type Props = {
  html: string;
  maxTextLength?: number;
};

export default class RenderHtml extends PureComponent<Props> {
  ignoredTags = ["head"];
  textTags = ["span", "strong", "em", "p", "a"];

  textLength = 0;

  renderTextNode(textNode: Node, index: number) {
    if (this.props.maxTextLength) {
      // @ts-ignore
      this.textLength += (textNode.data as string).length;
    }

    // @ts-ignore
    return <RNText key={index}>{textNode.data}</RNText>;
  }

  renderElement(element: NodeWithChildren, index: number) {
    // @ts-ignore
    if (this.ignoredTags.indexOf(element.name) > -1) {
      return null;
    }
    // @ts-ignore
    const Wrapper = this.textTags.indexOf(element.name) > -1 ? Text : View;

    const props: TextProps = {};
    // @ts-ignore
    if (element.name === "a") {
      props.style = {
        color: "#007AFF",
      };
      props.onPress = () => {
        // @ts-ignore
        Linking.openURL(element.attribs?.href);
      };
    }

    return (
      // @ts-ignore
      <Wrapper key={index} {...props}>
        {element.children.map((c, i) =>
          this.renderNode(c as NodeWithChildren, i)
        )}
      </Wrapper>
    );
  }

  renderNode(node: NodeWithChildren, index: number) {
    switch (node.type) {
      case ElementType.Text:
        return this.renderTextNode(node, index);
      case ElementType.Tag:
        return this.renderElement(node, index);
    }
    return null;
  }

  render() {
    const document = parseDocument(this.props.html);
    const children = [];

    for (let i = 0; i < document.children.length; i++) {
      if (
        this.props.maxTextLength &&
        this.textLength > this.props.maxTextLength
      ) {
        break;
      }
      // @ts-ignore
      children.push(this.renderNode(document.children[i], i));
    }

    return <Flex>{children}</Flex>;
  }
}
