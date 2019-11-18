import React from 'react';
import { StyleSheet, Text, View, Button, Dimensions, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
const screenWidth = Math.round(Dimensions.get('window').width);
let blank = require('./blank.png')
let rotate = require('./rotate.png')
let x = require('./cross.png')
let nightKing = require("./faces/nightKing.png");
import characters from "./characters.js"

export default class Square extends React.Component {
  
  handlePress = () => {
    if(this.props.isBottom){
      return
    }
    return this.props.handlePress(this.props.id)
  }
  
  getImage = () => {
    let {firstVal, secondVal, showingBoard1, firstCharacter, bottomVal} = this.props
    
    if(showingBoard1){
      if(firstVal === 1 || firstVal === 3 || bottomVal > 0){
        for(let i = 0; i < characters.length; i++){
          if(firstCharacter === characters[i].name){
            return characters[i].img
          }
        }
      }
      return blank
    }
    
    return secondVal === 3 || bottomVal > 0 ? nightKing : blank
  }

  render() {
    let {gameStarted, isRefSquare, showingBoard1, firstVal, secondVal, isBottom, bottomVal} = this.props
    return (
      <TouchableOpacity style={isBottom ? styles.bottom : styles.itemContainer} onPress = {this.handlePress}>
        <Image style = {styles.face} source =  {this.getImage()} />
        {!gameStarted && isRefSquare ? (<Image style = {styles.rotate} source =  {rotate} />): (null)}
        {gameStarted && ((showingBoard1 && firstVal === 2) || (!showingBoard1 && secondVal === 2)) ? (<Image style = {styles.face} source =  {x}/>) : (null)}
        {gameStarted && ((showingBoard1 && (firstVal === 3 || bottomVal > 1)) || (!showingBoard1 && (secondVal === 3 || bottomVal > 1))) ? (<Image style = {styles.deadFace} source =  {blank}/>) : (null)}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: 'transparent',
    height: screenWidth * 0.9 * 0.1,
    borderWidth: 1,
    borderColor: 'white'
  },
  bottom: {
    backgroundColor: 'transparent',
    height: screenWidth * 0.9 * 0.1
  },
  face: {
    maxWidth: screenWidth * 0.9 * 0.1 * 0.9,
    maxHeight: screenWidth * 0.9 * 0.1 * 0.9,
    position: 'absolute',
  },
  deadFace: {
    maxWidth: screenWidth * 0.9 * 0.1,
    maxHeight: screenWidth * 0.9 * 0.1,
    position: 'absolute',
    backgroundColor: 'red',
    opacity: 0.25
  },
  rotate: {
    maxWidth: screenWidth * 0.9 * 0.1 * 0.75,
    maxHeight: screenWidth * 0.9 * 0.1 * 0.75,
    position: 'absolute',
    alignSelf: 'center',
    opacity: 0.7
  }
});
