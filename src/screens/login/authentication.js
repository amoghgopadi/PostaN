import React, { Component } from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import SolidButton from '../../common/buttons/SolidButton';
import { WebView } from 'react-native-webview';
import Deso from 'deso-protocol';

let identityWindow = null
let loginResolve = null

class Authentication extends Component {

    state = {
        signUpWithWebView: false,
        uri: 'https://identity.deso.org/log-in?accessLevelRequest='+2
    }

    goToSignUp = async () => {
      console.log('signup ','1')
      const deso = new Deso();
      console.log('signup 2', deso)
      const request = 3;
      
      const response = await deso.identity.login(request);
      console.log('signup 4',response)
    
        // console.log('signup ','1')
        // this.setState({
        //     signUpWithWebView: true, 
        //     uri: 'https://identity.deso.org/log-in?accessLevelRequest='+2
        // })
    //    const user = await this.loginAsync(4)
        // console.log('signup 4',user)
        // console.log('signup 5',user.publicKey)
    }

    loginAsync(accessLevel) {
        console.log('signup ','2')
        return new Promise((resolve, reject) => {
          identityWindow = window.open('https://identity.deso.org/log-in?accessLevelRequest='+accessLevel, "_blank")
          console.log('signup 3',identityWindow)
          loginResolve = resolve
        })
        
      }


       login = async () => {
        const user = await loginAsync(4)
        setSetPublicKey(user.publicKey)
        setLoggedIn(true)
      }

      onLoadStart = (data) => {
        console.log('ON load start ', data)
      }

      onLoadEnd = (data) => {
        console.log('ON load end ', data)
      }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: '#00000f', width: '100%'}}>
                {
                    this.state.signUpWithWebView ?
                     <WebView
                     onLoadStart={this.onLoadStart}
                     onLoadEnd={this.onLoadEnd}
                     source={{
                        uri: this.state.uri
                      }}
                    />
                    : 
                    <SolidButton 
                       buttonName={'Get started'}
                       onPress={this.goToSignUp}
                   />
                }
            </View>
        )
    }
}

export default Authentication