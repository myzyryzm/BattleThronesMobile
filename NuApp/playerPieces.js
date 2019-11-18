class Piece{
  constructor(size, dex){
    this.size = size;
    this.positions = [];
    this.hits = [];
    this.sunk = false;
    this.rotation = 0;
    this.pieceDex = dex
  }

  referenceSquare(){
    return this.positions[0]
  }

  hasSunkPiece(dex){
    this.hits.push(dex);
    this.sunk = this.hits.length === this.positions.length
    return this.sunk;
  }

  rotatePiece(spaces){
    let rot = this.rotation;
    let finPos = [];
    let anchorPoint = rot === 0 || rot === 270 ? Math.min(...this.positions) : Math.max(...this.positions);
    let anchorRemainder = anchorPoint > 9 ? anchorPoint - anchorPoint % 10 : 0;
    let nuRot = false;

    for(let i = 0; i < 4; i++){
      rot += 90;
      rot = rot < 360 ? rot : 0;
      let canRotate = true;
      finPos = [anchorPoint];
      for(let j = 1; j < this.size; j++){
        if(rot === 0){
          let dex = anchorPoint + 10 * j
          finPos[j] = dex
          if(dex > 99){
            canRotate = false;
            break;
          }
        }
        else if(rot === 90){
          let dex = anchorPoint - j
          let rem = dex > 9 ? dex - dex % 10 : 0;
          finPos[j] = dex
          if(dex < 0 || rem != anchorRemainder){
            canRotate = false;
            break;
          }
        }
        else if(rot === 180){
          let dex = anchorPoint - 10 * j
          finPos[j] = dex
          if(dex < 0){
            canRotate = false;
            break;
          }
        }
        else if(rot === 270){
          let dex = anchorPoint + j
          let rem = dex > 9 ? dex - dex % 10 : 0;
          finPos[j] = dex
          if(dex > 99 || rem != anchorRemainder){
            canRotate = false;
            break;
          }
        }
      }
      if(canRotate){
        nuRot = true;
        for(let k = 0; k < finPos.length; k++){
          if(spaces.includes(finPos[k])){
            nuRot = false;
            break;
          }
        }
        if(nuRot){
          break;
        }
      }
    }
    if(nuRot){
      this.positions = finPos;
      this.rotation = rot;
    }
  }
}

class PlayerPieces{
  constructor(){
    this.gamePieces = [new Piece(2, 0), new Piece(3, 1), new Piece(3, 2), new Piece(4, 3), new Piece(5, 4)];
    this.squares = Array(100).fill(0);
    this.originalSquares = Array(100).fill(0);
  }

  setItUp(){
    this.originalSquares = this.squares;
    for(let i = 0; i < this.gamePieces.length; i++){
      let piece = this.gamePieces[i]
      let firstNum = 100 - 10 * piece.size
      for(let j = 0; j < piece.size; j++){
        let nuDex = i + firstNum + 10 * j
        piece.positions.push(nuDex)
        this.squares[nuDex] = 1
      }
    }
  }

  getPieceBySquare(square){
    for(let i = 0; i < this.gamePieces.length; i++){
      let gp = this.gamePieces[i]
      if(gp.positions.includes(square)){
        return gp
      }
    }
  }

  getSunkShips(){
    let sunk = []
    for(let i = 0; i < this.gamePieces.length; i++){
      let gp = this.gamePieces[i]
      if(gp.sunk){
        sunk.push(gp.pieceDex)
      }
    }
    return sunk
  }

  reset(isAI){
    this.gamePieces = [new Piece(2, 0), new Piece(3, 1), new Piece(3, 2), new Piece(4, 3), new Piece(5, 4)];
    this.squares = Array(100).fill(0);
    if(isAI){
      return
    }
    this.setItUp()
  }

  hasLost(){
    let lost = true;
    for(let i = 0; i < this.gamePieces.length; i++){
      if(!this.gamePieces[i].sunk){
        lost = false;
        break;
      }
    }
    return lost;
  }

  canPlaceGamepiece(arr, pieceDex){
    for(let i = 0; i < this.gamePieces.length; i++){
      let piece = this.gamePieces[i]
      if(piece.pieceDex != pieceDex){
        for(let j = 0; j < arr.length; j++){
          if(piece.positions.includes(arr[j])){
            return false
          }
        }
      }
    }
    
    return true;
  }

  updatePiecePosition(nuPositions, pieceDex){
    let piece = null
    for(let i = 0; i < this.gamePieces.length; i++){
      let piece = this.gamePieces[i]
      if(piece.pieceDex != pieceDex){
        for(let j = 0; j < nuPositions.length; j++){
          if(piece.positions.includes(nuPositions[j])){
            return
          }
        }
      }
    }
    piece = null
    for(let i = 0; i < this.gamePieces.length; i++){
      if(this.gamePieces[i].pieceDex == pieceDex){
        piece = this.gamePieces[i]
        break;
      }
    }
    let oldPositions = piece.positions
    for(let i = 0; i < oldPositions.length; i++){
      this.squares[oldPositions[i]] = 0
    }
    for(let i = 0; i < nuPositions.length; i++){
      this.squares[nuPositions[i]] = 1
      piece.positions[i] = nuPositions[i]
    }
  }

  addPiece(spaces, dex){
    for(let i = 0; i < spaces.length; i++){
      this.squares[spaces[i]] = 1;
    }
    this.gamePieces[dex].positions = spaces
  }

  canAttackPiece(dex){
    return this.squares[dex]<= 1;
  }

  attackPiece(dex){
    let hasSunk = false;
    let num = 0;
    if(this.squares[dex] === 1){
      for(let i = 0; i < this.gamePieces.length; i++){
        if(this.gamePieces[i].positions.includes(dex)){
          hasSunk = this.gamePieces[i].hasSunkPiece(dex);
          break;
        }
      }
      if(hasSunk){
        num = 2;
      }
      else{
        num = 1;
      }
    } else {
      num = 0;
    }
    this.squares[dex]+=2;
    return num;
  }

  canHitPiece(dex){
    return this.squares[dex]=== 1;
  }

  aiAttackPiece(dex){
    let hit = false;
    let hasSunk = false;
    if(this.squares[dex] === 1){
      hit = true;
      for(let i = 0; i < this.gamePieces.length; i++){
        if(this.gamePieces[i].positions.includes(dex)){
          hasSunk = this.gamePieces[i].hasSunkPiece(dex);
          break;
        }
      }
    }
    this.squares[dex]+=2;
    return hit;
  }

  rotatePiece(dex){
    let piece = null
    for (let i = 0; i< this.gamePieces.length; i++){
      if(this.gamePieces[i].pieceDex === dex){
        piece = this.gamePieces[i]
        break
      }
    }
    let initSpaces = piece.positions;
    let occupiedSpaces = [];
    for(let i = 0; i < this.gamePieces.length; i++){
      if(i != dex){
        for(let j = 0; j < this.gamePieces[i].positions.length; j++){
          occupiedSpaces.push(this.gamePieces[i].positions[j]);
        }
      }
    }
    this.gamePieces[dex].rotatePiece(occupiedSpaces);
    let nuSpaces = this.gamePieces[dex].positions;
    for(let i = 0; i < initSpaces.length; i++){
      this.squares[initSpaces[i]] = 0;
      this.squares[nuSpaces[i]] = 1;
    }
  }
}

let user = new PlayerPieces()
user.setItUp()
let opponent = new PlayerPieces()
opponent.setItUp()
export default [user,opponent];
