import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import PostCard from './PostCard';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { FlatList } from 'react-native-gesture-handler';
import firebase from "firebase";

let customFonts = {
  'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
};

let posts = require('./posts-items.json');

export default class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false,
      light_theme: true,
      stories: []
    };
  }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser();
    this.fetchStories();
  }
  fetchStories = () => {
    firebase
      .database()
      .ref("/posts/")
      .on(
        "value",
        snapshot => {
          let stories = [];
          if (snapshot.val()) {
            Object.keys(snapshot.val()).forEach(function (key) {
              stories.push({
                key: key,
                value: snapshot.val()[key]
              });
            });
          }
          this.setState({ stories: stories });
          this.props.setUpdateToFalse();
        },
        function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        }
      );
  };

  fetchUser = () => {
    let theme;
    firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid)
      .on("value", snapshot => {
        theme = snapshot.val().current_theme;
        this.setState({ light_theme: theme === "light" });
      });
  };

  renderItem = ({ item: post }) => {
    return <PostCard post={post} navigation={this.props.navigation} />;
  };

  keyExtractor = (item, index) => index.toString();

  render() {
    if (!this.state.fontsLoaded) {
      return <AppLoading />;
    } else {
      return (
        <View style={this.state.light_theme ? styles.containerLight : styles.container}>
          <SafeAreaView style={styles.droidSafeArea} />
          <View style={styles.appTitle}>
            <View style={styles.appIcon}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.iconImage}></Image>
            </View>
            <View style={styles.appTitleTextContainer}>
              <Text style={this.state.light_them ? styles.appTitleTextLight: styles.appTitleText}>SPECTAGRAM</Text>
            </View>
          </View>
          {!this.state.stories[0] ? (
            <View style={styles.noPosts}>
              <Text
                style={
                  this.state.light_theme
                    ? styles.noPostTextLight
                    : styles.noPostText
                }
              >
                No Posts Available
              </Text>
            </View>
          ) : (
            <View style={styles.cardContainer}>
              <FlatList
                keyExtractor={this.keyExtractor}
                data={this.state.stories}
                renderItem={this.renderItem}
              />
            </View>
          )}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  containerLight: {
    flex: 1,
    backgroundColor: '#fff',
  },
  droidSafeArea: {
    marginTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : RFValue(35),
  },
  appTitle: {
    flex: 0.07,
    flexDirection: 'row',
  },
  appIcon: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: 'center',
  },
  appTitleText: {
    color: 'white',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  appTitleTextLight: {
    color: '#000',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  cardContainer: {
    flex: 0.93,
  },
  noPosts: {
    flex: 0.85,
    justifyContent: "center",
    alignItems: "center"
  },
  noPostTextLight: {
    color: "black",
    fontSize: RFValue(40),
    fontFamily: "Bubblegum-Sans"
  },
  noPostText: {
    color: "white",
    fontSize: RFValue(40),
    fontFamily: "Bubblegum-Sans"
  }
});
