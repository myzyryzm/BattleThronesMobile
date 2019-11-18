import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import Board from './Board';
import ChooseCharacter from './ChooseCharacter';

const AppNavigator = createStackNavigator({
    ChooseCharacter: {
      screen: ChooseCharacter,
      navigationOptions: () => ({
        
      }),
    },
    Board: { 
      screen: Board 
    },
  },
  {
    headerMode: 'none',
    mode: 'modal',
    cardStyle: { backgroundColor: 'black' },
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  }
);

export default createAppContainer(AppNavigator);
