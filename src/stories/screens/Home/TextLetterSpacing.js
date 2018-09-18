import React from "react";
import { StyleSheet, View, Text } from "react-native";

const spacingForLetterIndex = (letters, index, spacing) => {
  if (letters.length - 1 === index) {
    return 0;
  } else {
    if (letters.length <= 4) {
     return spacing;
    } else {
      if ((index + 1) % 3 === 0 ) {
        return spacing * 4;
      } else {
          return spacing;
      }
    }
  }
}

export const TextLetterSpacing = (props) => {
  const { children, spacing, viewStyle, textStyle } = props;
  const letters = children.split("");


  return <View style={[styles.container, viewStyle]}>
    {letters.map((letter, index) =>
      <Text key={index}  style={[textStyle, { paddingRight: spacingForLetterIndex(letters, index, spacing)} ]}>
        {letter}
      </Text>
    )}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  }
});
