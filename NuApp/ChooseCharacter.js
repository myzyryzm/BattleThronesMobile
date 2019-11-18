import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { TouchableOpacity } from 'react-native-gesture-handler';
import characters from "./characters.js"
import * as Font from 'expo-font';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
let fontLoaded = false
let throne = require("./throne2.gif");

export default class ChooseCharacter extends Component {

  constructor(props){
    super(props)
    this.state = {
      updated: false
    }
  }

  async componentDidMount() {
    await Font.loadAsync({
      'got': require('./assets/fonts/got.ttf'),
    });
    fontLoaded = true
    this.setState({updated: !this.state.updated})
  }

  selectCharacter = (item) => {
    return this.props.navigation.navigate("Board", {firstCharacter:item.name})
  }
  render() {
    return (
      <View style={styles.wrap}>
        <View style = {styles.imageContainer}>
          <Image style = {styles.background} source =  {throne} />
        </View>
        <Text style = {fontLoaded ? styles.gotTitle : styles.title}>Choose Character</Text>
        <FlatGrid
        itemDimension={screenWidth * 0.9 * 0.4}
        items={characters}
        style={styles.gridView}
        staticDimension={screenWidth * 0.9}
        spacing = {5}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.itemContainer} onPress = {() => { this.selectCharacter(item) }}>
            <Image style = {styles.face} source =  {item.img} />
            <Text style={fontLoaded ? styles.gotName : styles.itemName}>{item.name}</Text>
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
    backgroundColor: 'transparent'
  },
  wrap: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemContainer: {
    justifyContent: 'flex-end',
    height: screenWidth * 0.9 * 0.45,
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 50
  },
  itemName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 10
  },
  gotName: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'got',
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
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  gotTitle: {
    marginTop: screenHeight * 0.1,
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'got',
    backgroundColor: 'transparent',
    textShadowColor: '#bf2d32',
    textShadowOffset: {width: 1, height: 0},
    textShadowRadius: 3
  },
  imageContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  background: {
    alignSelf: "center",
    maxHeight: screenHeight
  },
});
