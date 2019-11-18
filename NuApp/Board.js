import React from 'react';
import { StyleSheet, Text, View, Button, Dimensions, PanResponder, Alert, Image } from 'react-native';
import { FlatGrid} from 'react-native-super-grid';
import Square from './Square';
import playerPieces from './playerPieces.js';
import { TouchableOpacity } from 'react-native-gesture-handler';
let throne = require("./throne.jpg");
let throne2 = require("./throne2.gif");

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
let firstPlayer = {
  pieces: playerPieces[0],
  refSquares: [],
  won : false,
  streaking: false,
  activatedSpecial: false
};
let secondPlayer = {
  pieces: playerPieces[1],
  won : false,
  streaking: false,
  activatedSpecial: false
};
let fillArray = Array(100).fill(0)
let bottomFillArray = Array(20).fill(0)
let gameStarted = false
let locationX = 0
let locationY = 0
let drag = {
  offset: 0,
  draggingPiece: false,
  piece: null,
  diff: 0
}
let ai = {
  guesses: [],
  hits: [],
  hitDirection: ""
}
let startSquare = 0
let showingBoard1 = true
let firstPlayerTurn = true
let gameOver = false
let bottomGrid = []

export default class Board extends React.Component {
  
  constructor (props) {
    super(props)
    this.panResponder;
    this.firstCharacter = this.props.navigation.getParam('firstCharacter');
    this.state = {
      updated: false
    }
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => {true},
      onStartShouldSetPanResponderCapture: (event, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (event, gestureState) => false,
      onPanResponderGrant: (event, gestureState) => {
        locationX = event.nativeEvent.locationX.toFixed(2)
        locationY = event.nativeEvent.locationY.toFixed(2)
        this.startDrag()
      },
      onPanResponderMove: (event, gestureState) => {
        //After the change in the location 
        //state will be upated to re-render the screen and show the location in view
        locationX = event.nativeEvent.locationX.toFixed(2)
        locationY = event.nativeEvent.locationY.toFixed(2)
        this.duringDrag()
      },
      onPanResponderRelease: (event, gestureState) => {
        locationX = event.nativeEvent.locationX.toFixed(2)
        locationY = event.nativeEvent.locationY.toFixed(2)
        this.endDrag()
      },
    });
}

  handlePress = (id) => {
    if(gameOver || showingBoard1 || !gameStarted || !firstPlayerTurn){
      return
    }

    if(firstPlayerTurn){
      let pieces = secondPlayer.pieces;
      if(pieces.canAttackPiece(id)){
        let dex = pieces.attackPiece(id);
        secondPlayer.pieces = pieces
        firstPlayerTurn = dex > 0
        if(!firstPlayer.streaking || dex != 1){
          let pause = dex === 0 ? 500 : 0
          Alert.alert(
            this.getAlertText(dex, false),
            this.getSubAlertText(dex,false),
            [
              {text: 'OK', onPress: () => setTimeout(() => this.finishPlayerTurn(dex), pause)},
            ],
            {cancelable: false},
          );
        }
      }
    }
    this.setState({updated: !this.state.updated})
  }

  finishPlayerTurn = (dex) => {
    this.checkIfWinner();
    if(dex != 0){
      firstPlayer.streaking = true
    }
    showingBoard1 = !gameOver && dex === 0
    if(!gameOver){
      if(dex == 0){
        firstPlayer.streaking = false
        setTimeout(this.startAITurn, 1000)
      }
    }
    this.setState({updated: !this.state.updated})
  }

  checkIfWinner = () =>{
    if(firstPlayer.pieces.hasLost()){
      alert("You lost!")
      secondPlayer.won = true
      gameOver = true
    }
    else if(secondPlayer.pieces.hasLost()){
      alert("You won!")
      firstPlayer.won = true
      gameOver = true
    }
  }

  getRandomGuess = () => {
    let squares = firstPlayer.pieces.squares;
    let id = Math.floor(Math.random() * 100);
    if(squares[id] <= 1){
      return id;
    }
    return this.getRandomGuess();
  }

  startAITurn = () => {
    let pieces = firstPlayer.pieces;
    let hits = ai.hits;
    let guesses = ai.guesses;
    let hitDirection = ai.hitDirection;
    let nextGuess = 0;
    let guessDirection = "";

    if(hits.length === 0) {
      nextGuess = this.getRandomGuess();
    }
    else if(hits.length === guesses.length) {
      let prevHit = hits[hits.length - 1];
      if(hits.length === 1){
        nextGuess = prevHit + 10;
        if(prevHit < 90 && pieces.canAttackPiece(nextGuess)){
          guessDirection = "Up";
        }
        else {
          nextGuess = prevHit - 10;
          guessDirection = "Down";
        }
      }
      else {
        let prevPrevHit = hits[hits.length - 2];
        let diff = prevHit - prevPrevHit;
        if(diff === 10){
          nextGuess = prevHit + 10;
          if(prevHit < 90 && pieces.canAttackPiece(nextGuess)){
            guessDirection = "Up";
          }
          else{
            nextGuess = hits[0] - 10;
            guessDirection = "Down";
          }
        }
        else if(diff === -10){
          nextGuess = prevHit - 10;
          if(prevHit > 9 && pieces.canAttackPiece(nextGuess)){
            guessDirection = "Down";
          }
          else{
            nextGuess = hits[0] + 10;
            guessDirection = "Up";
          }
        }
        else if(diff === 1){
          let prevRemainder = prevHit % 10;
          nextGuess = prevHit + 1;
          if(prevRemainder != 9 && pieces.canAttackPiece(nextGuess)){
            guessDirection = "Right";
          }
          else {
            nextGuess = hits[0] - 1;
            guessDirection = "Left";
          }
        }
        else if(diff === -1){
          let prevRemainder = prevHit % 10;
          nextGuess = prevHit - 1;
          if(prevRemainder != 0 && pieces.canAttackPiece(nextGuess)){
            guessDirection = "Left";
          }
          else{
            nextGuess = hits[0] + 1;
            guessDirection = "Right";
          }
        }
      }
    }
    else {
      if(hits.length === 1){
        let firstHit = hits[0];
        let firstRem = firstHit % 10;
        let canGuessUp = !hits.includes(firstHit + 10) && firstHit < 90 && pieces.canAttackPiece(firstHit + 10);
        let canGuessDown = !hits.includes(firstHit - 10) && firstHit > 9 && pieces.canAttackPiece(firstHit - 10);
        let canGuessRight = !hits.includes(firstHit + 1) && firstRem < 9 && pieces.canAttackPiece(firstHit + 1);
        let canGuessLeft = !hits.includes(firstHit - 1) && firstRem > 0 && pieces.canAttackPiece(firstHit - 1);
        if(canGuessUp){
          nextGuess = firstHit + 10;
          guessDirection = "Up";
        }
        else if(canGuessDown){
          nextGuess = firstHit - 10;
          guessDirection = "Down";
        }
        else if(canGuessRight){
          nextGuess = firstHit + 1;
          guessDirection = "Right";
        }
        else if(canGuessLeft){
          nextGuess = firstHit - 1;
          guessDirection = "Left";
        }
      }
      else{
        let prevHit = hits[hits.length - 1];
        let prevPrevHit = hits[hits.length - 2];
        let firstHit = hits[0];
        let prevGuess = guesses[guesses.length - 1];
        if(prevHit != prevGuess){
          //switch directions
          let vertical = hits.includes(firstHit + 10);
          let horizontal = hits.includes(firstHit + 1);
          if(vertical){
            nextGuess = firstHit - 10;
            guessDirection = "Down";
          }
          else{
            nextGuess = firstHit - 1;
            guessDirection = "Left";
          }
        }
        else{
          if(hitDirection === "Up"){

          }
          else if(hitDirection === "Down"){
            guessDirection = "Down";
            nextGuess = prevHit - 10;
          }
          else if(hitDirection === "Right"){
            let rem = prevHit % 10;
            if(rem < 9 && pieces.canAttackPiece(prevHit + 1)){
              guessDirection = "Right";
              nextGuess = prevHit + 1;
            }
            else{
              guessDirection = "Left";
              nextGuess = firstHit - 1;
            }
          }
          else if(hitDirection === "Left"){
            guessDirection = "Left";
            nextGuess = prevHit - 1;
          }
        }
      }
    }
    guesses.push(nextGuess);

    if(pieces.canHitPiece(nextGuess)){
      hits.push(nextGuess);
      hitDirection = guessDirection;
    }
    if(hits.length === 0){
      guesses = [];
    }
    let dex = pieces.attackPiece(nextGuess)
    this.checkIfWinner();
    if(dex === 2){
      hits = [];
      guesses = [];
      hitDirection = "";
    }

    firstPlayer.pieces = pieces;
    ai.hits = hits;
    ai.guesses = guesses;
    ai.hitDirection = hitDirection;
    if(gameOver){
      this.setState({updated: !this.state.updated})
      return
    }
    if(dex != 1 || !secondPlayer.streaking){
      let pause = dex === 0 ? 500 : 0
      Alert.alert(
        this.getAlertText(dex, true),
        this.getSubAlertText(dex,true),
        [
          {text: 'OK', onPress: () => setTimeout(() => this.finishAITurn(dex), pause)},
        ],
        {cancelable: false},
      );
    }
    else {
      setTimeout(this.startAITurn, 250)
    }
    this.setState({updated: !this.state.updated})
  }

  finishAITurn = (dex) => {
    if(dex > 0){
      secondPlayer.streaking = true
      setTimeout(this.startAITurn, 250)
    }
    else{
      secondPlayer.streaking = false
      showingBoard1 = false
      firstPlayerTurn = true
    }
    this.setState({updated: !this.state.updated})
  }

  getAlertText = (dex, isOpponenet) => {
    if(dex === 0){
      return isOpponenet ? "Your opponent missed!" : "You missed!";
    }
    if(dex === 1){
      return isOpponenet ? "Your ship has been hit!" : "You hit their ship!";
    }
    if(dex === 2){
      return isOpponenet ? "Your ship has been sunk!" : "You sank their ship!";
    }
  }

  getSubAlertText = (dex, isOpponenet) => {
    if(dex === 0){
      return isOpponenet ? "Your move " + this.firstCharacter + "!" : "Night King's Turn!";
    }
    if(dex === 1 || dex === 2){
      return isOpponenet ? "The Night King marches!" : "Continue fighting " + this.firstCharacter + "!";
    }
  }

  startUserTurn = () => {
    showingBoard1 = false
    firstPlayerTurn = true
    this.setState({updated: !this.state.updated})
  }
  
  getCurrentDragPosition = () => {
    let gridPix = screenWidth * 0.9
    let column = Math.floor(locationX / gridPix * 10)
    column = column < 0 ? 0 : column > 9 ? 9 : column
    let row = Math.floor(locationY/gridPix * 10)
    row = row < 0 ? 0 : row > 9 ? 9 : row
    dragSquare = row * 10 + column
  }

  startDrag = () => {
    console.log("starting drag")
    let gridPix = screenWidth * 0.9
    let column = Math.floor(locationX / gridPix * 10)
    column = column < 0 ? 0 : column > 9 ? 9 : column
    let row = Math.floor(locationY/gridPix * 10)
    row = row < 0 ? 0 : row > 9 ? 9 : row
    startSquare = row * 10 + column
    dragSquare = startSquare
    
    if(firstPlayer.pieces.squares[startSquare] === 1){
      drag.draggingPiece = true
      drag.offset = 0
      drag.piece = firstPlayer.pieces.getPieceBySquare(startSquare)
      let piece = drag.piece
      drag.offset = piece.referenceSquare() - startSquare
      drag.diff = drag.piece.positions[1] - drag.piece.positions[0]
    }
    this.setState({updated: !this.state.updated})
  }

  duringDrag = () => {
    if(drag.draggingPiece){
      let gridPix = screenWidth * 0.9
      let column = Math.floor(locationX / gridPix * 10)
      column = column < 0 ? 0 : column > 9 ? 9 : column
      let row = Math.floor(locationY/gridPix * 10)
      row = row < 0 ? 0 : row > 9 ? 9 : row
      let curSquare = row * 10 + column
      dragSquare = curSquare
      let offsetSquare = curSquare + drag.offset
      let piece = drag.piece
      
      if(offsetSquare === piece.referenceSquare()){
        return
      }
      let nuPositions = []
      
      for(let i = 0; i < piece.positions.length; i++){
        let nuPos = offsetSquare + i * drag.diff
        if(Math.abs(drag.diff) === 1){
          if((nuPos - nuPos % 10) != row * 10){
            return;
          }
        } else {
          if(nuPos > 99){
            return
          }
        }
        nuPositions.push(nuPos)
      }
      firstPlayer.pieces.updatePiecePosition(nuPositions, piece.pieceDex)
    }
    this.setState({updated: !this.state.updated})
  }

  endDrag = () => {
    let gridPix = screenWidth * 0.9
    let column = Math.floor(locationX / gridPix * 10)
    column = column < 0 ? 0 : column > 9 ? 9 : column
    let row = Math.floor(locationY/gridPix * 10)
    row = row < 0 ? 0 : row > 9 ? 9 : row
    let endSquare = row * 10 + column
    if(drag.draggingPiece){
      if(endSquare === startSquare){
        if(drag.offset === 0){
          firstPlayer.pieces.rotatePiece(drag.piece.pieceDex)
        }
      }
    }
    drag.draggingPiece = false
    drag.offset = 0
    drag.piece = null
    drag.diff = 0
    this.setState({updated: !this.state.updated})
  }
  
  getFirstPlayerRefSquares = () => {
    let pieces = firstPlayer.pieces.gamePieces
    firstPlayer.refSquares = []
    for(let i = 0; i < pieces.length; i++){
      let piece = pieces[i]
      firstPlayer.refSquares.push(piece.referenceSquare()) 
    }
  }

  changeBoard = () => {
    showingBoard1 = !showingBoard1
    this.setState({updated: !this.state.updated})
  }

  resetGame = () => {
    firstPlayer.pieces.reset(false);
    firstPlayer.won = false
    firstPlayer.streaking = false
    secondPlayer.pieces.reset(true);
    secondPlayer.won = false
    secondPlayer.streaking = false
    gameOver = false
    gameStarted = false
    showingBoard1 = true
    firstPlayerTurn = true
    this.getFirstPlayerRefSquares()
    this.setState({updated: !this.state.updated})
  }

  createAIBoard = () => {
    secondPlayer.pieces.reset(true)
    for(let i = 0; i < 5; i++){
      this.createAIPiece(i);
    }
    gameStarted = true
    showingBoard1 = false
    this.setState({updated: !this.state.updated})
  }

  createAIPiece = (dex) => {
    let pieces = secondPlayer.pieces;
    let size = pieces.gamePieces[dex].size;
    let spaces = [];
    let canPlace = true;
    let id = Math.floor(Math.random() * 100)
    for(let i = 0; i < size; i++){
      let randomDex = id + 10 * i
      if(randomDex > 99){
        canPlace = false;
      }
      spaces.push(randomDex)
    }
    if(!canPlace){
      this.createAIPiece(dex);
    }
    else {
      if(pieces.canPlaceGamepiece(spaces)){
        pieces.addPiece(spaces, dex)
        let numRot = Math.floor(Math.random() * 3)
        for(let i = 0; i < numRot; i++){
          pieces.rotatePiece(dex);
        }
        secondPlayer.pieces = pieces
      }
      else{
        this.createAIPiece(dex);
      }
    }
  }

  getBottomVal = (id) => {
    let sunkShips = showingBoard1 ? firstPlayer.pieces.getSunkShips() : secondPlayer.pieces.getSunkShips()
    if(id === 2 || id === 6 || id === 14){
      return 0
    }
    if(id > 14){
      return sunkShips.includes(4) ? 2 : 1
    }
    if(id > 9){
      return sunkShips.includes(3) ? 2 : 1
    }
    if(id > 6){
      return sunkShips.includes(2) ? 2 : 1
    }
    if(id > 2){
      return sunkShips.includes(1) ? 2 : 1
    }
    return sunkShips.includes(0) ? 2 : 1
  }

  activateSpecial = (isFirst) => {

  }

  render() {
    if(!gameStarted){
      this.getFirstPlayerRefSquares()
    } else if(firstPlayer.refSquares.length > 0){
      firstPlayer.refSquares = []
    }
    let grid = fillArray.map((element, i)=> {
      return <Square key = {i.toString()} id = {i} firstVal = {firstPlayer.pieces.squares[i]} secondVal = {secondPlayer.pieces.squares[i]} handlePress = {this.handlePress} gameStarted = {gameStarted} isRefSquare = {firstPlayer.refSquares.includes(i)} showingBoard1 = {showingBoard1} firstCharacter = {this.firstCharacter} isBottom = {false} bottomVal = {0}/>
    })
    if(gameStarted){
      bottomGrid = bottomFillArray.map((element, i)=> {
        return <Square key = {i.toString()} id = {i} firstVal = {0} secondVal = {0} handlePress = {this.handlePress} gameStarted = {gameStarted} isRefSquare = {false} showingBoard1 = {showingBoard1} firstCharacter = {this.firstCharacter} isBottom = {true} bottomVal = {this.getBottomVal(i)}/>
      })
    }
    return (
      <View style={styles.container}>
        <View style = {styles.imageContainer}>
          <Image style = {styles.background} source =  {throne2} />
        </View>
        <View style = {styles.buttonOneContainer}>
          {<TouchableOpacity onPress={gameStarted ? this.changeBoard : this.createAIBoard}><Text style={styles.buttonText}>{!gameStarted ? "Battle" : showingBoard1 ? "Show Opponent's Board" : "Show Your Board"}</Text></TouchableOpacity>}
        </View>
        <View style = {styles.buttonTwoContainer}>
          {<TouchableOpacity onPress={gameStarted ? this.resetGame : () => this.props.navigation.navigate("ChooseCharacter")}><Text style={styles.buttonText}>{!gameStarted ? "Choose Character" : "Reset"}</Text></TouchableOpacity>}
        </View>
        <FlatGrid
        itemDimension={screenWidth * 0.9 * 0.1}
        items={grid}
        style={styles.board}
        staticDimension={screenWidth * 0.9}
        fixed = {true}
        spacing={0}
        scrollEnabled={false}
        renderItem={({ item, index }) => (item)}
        ></FlatGrid>
        {gameStarted ? null : <View style={styles.childView} {...this.panResponder.panHandlers}/>}
        {!gameStarted ? null : 
        <FlatGrid
        itemDimension={screenWidth * 0.9 * 0.1}
        items={bottomGrid}
        style={styles.bottomGrid}
        staticDimension={screenWidth * 0.9}
        fixed = {true}
        spacing={0}
        scrollEnabled={false}
        renderItem={({ item, index }) => (item)}
        />}
        {!gameStarted || true ? null : 
        <View style = {styles.buttonThreeContiner}>
          {<TouchableOpacity onPress={() => this.activateSpecial(true)}><Text style={styles.buttonText}>Activate Special</Text></TouchableOpacity>}
        </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonOneContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0.075 * screenHeight
  },
  buttonTwoContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0.15 * screenHeight
  },
  buttonThreeContiner: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0.8 * screenHeight
  },
  imageContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0
  },
  background: {
    alignSelf: "center",
    maxHeight: screenHeight
  },
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  board: {
    position: "absolute",
    top: screenHeight * 0.25,
    backgroundColor: 'transparent'
  },
  bottomGrid: {
    position: "absolute",
    top: screenHeight * 0.88,
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 3
  },
  childView: {
    height: screenWidth * 0.9,
    width: screenWidth * 0.9,
    backgroundColor: 'transparent',
    position: "absolute",
    top: screenHeight * 0.25
  },
  buttonText: {
    fontSize: 25,
    color: 'white'
  }
});