import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { TouchableOpacity } from 'react-native-gesture-handler';
import characters from "./characters.js"
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class ChooseCharacter extends Component {

  selectCharacter = (item) => {
    return this.props.navigation.navigate("Board", {firstCharacter:item.name})
  }
  render() {
    return (
      <View style={styles.wrap}>
        <Text style = {styles.title}>Choose Character</Text>
        <FlatGrid
        itemDimension={screenWidth * 0.9 * 0.4}
        items={characters}
        style={styles.gridView}
        staticDimension={screenWidth * 0.9}
        spacing = {5}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.itemContainer} onPress = {() => { this.selectCharacter(item) }}>
            <Image style = {styles.face} source =  {item.img} />
            <Text style={styles.itemName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        />
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  gridView: {
    marginTop: screenHeight * 0.1,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: 'black'
  },
  wrap: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  itemContainer: {
    justifyContent: 'flex-end',
    height: screenWidth * 0.9 * 0.45,
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 100
  },
  itemName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 10
  },
  face: {
    maxWidth: screenWidth * 0.9 * 0.3,
    maxHeight: screenWidth * 0.9 * 0.3,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  title: {
    marginTop: screenHeight * 0.1,
    fontSize: 30,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center'
  },
});
