"use strict";

import React from "react";

import PropTypes from "prop-types";

import {
  View,
  WebView,
  Dimensions,
  RefreshControl,
  ScrollView
} from "react-native";

import BaseComponent from "./BaseComponent";
import Utils from "./Utils";

import styles from "./styles";

import BackButton from "./BackButton";
import StatusBar from "./StatusBar";
import AddressBar from "./AddressBar";
import Toolbar from "./Toolbar";

const WEBVIEW_REF = "webview";

const propTypes = {
  url: PropTypes.string,
  hideToolbar: PropTypes.bool,
  hideAddressBar: PropTypes.bool,
  hideStatusBar: PropTypes.bool,
  hideRefreshButton: PropTypes.bool,
  hideActivityIndicator: PropTypes.bool,
  foregroundColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  onNavigationStateChange: PropTypes.func,
  onShouldStartLoadWithRequest: PropTypes.func,
  backButtonVisible: PropTypes.bool,
  onBackPress: PropTypes.func,
  jsCode: PropTypes.string,
  cookie: PropTypes.string,
  webviewProps: PropTypes.object,
  pullToRefresh: PropTypes.bool
};

const defaultProps = {
  url: "",
  hideToolbar: false,
  hideAddressBar: false,
  hideStatusBar: false,
  hideRefreshButton: false,
  hideActivityIndicator: false,
  onNavigationStateChange: () => {},
  onShouldStartLoadWithRequest: () => true,
  backButtonVisible: true,
  jsCode: null,
  cookie: "",
  webviewProps: {},
  pullToRefresh: true
};

class Webbrowser extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      currentUrl: Utils.sanitizeUrl(this.props.url),
      url: Utils.sanitizeUrl(this.props.url),
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      homeButtonEnabled: true,
      loading: true,
      scalesPageToFit: true,
      jsCode: this.props.jsCode,
      cookie: this.props.cookie,
      refreshing: false
    };

    this._bind(
      "render",
      "goBack",
      "goHome",
      "goForward",
      "reload",
      "stop",
      "onNavigationStateChange",
      "onShouldStartLoadWithRequest",
      "renderToolbar"
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      url: Utils.sanitizeUrl(nextProps.url)
    });
  }

  renderAddressBar() {
    if (this.props.hideAddressBar) {
      return;
    }

    return (
      <AddressBar
        onReload={this.reload}
        onLoad={url => {
          this.load(url);
        }}
        url={this.state.currentUrl}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderBackButton() {
    return (
      <BackButton
        visible={this.props.backButtonVisible}
        onPress={this.props.onBackPress}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderStatusBar() {
    if (this.props.hideStatusBar) {
      return;
    }

    return (
      <StatusBar
        status={this.state.status}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderToolbar() {
    if (this.props.hideToolbar) {
      return;
    }

    return (
      <Toolbar
        onBack={this.goBack}
        onHome={this.reload}
        onForward={this.goForward}
        onStop={this.stop}
        backButtonEnabled={this.state.backButtonEnabled}
        forwardButtonEnabled={this.state.forwardButtonEnabled}
        hideRefreshButton={this.props.hideRefreshButton}
        foregroundColor={this.props.foregroundColor}
        webViewRef={this.refs[WEBVIEW_REF]}
      />
    );
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          this.props.backgroundColor && {
            backgroundColor: this.props.backgroundColor
          }
        ]}
        refreshControl={
          this.props.pullToRefresh ? (
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
              title={"Refreshing"}
            />
          ) : null
        }
      >
        {this.state.refreshing && (
          <View
            style={{
              zIndex: 1000,
              height: Dimensions.get("window").height,
              backgroundColor: "#f0f0f0"
            }}
          />
        )}
        <View style={styles.header}>
          <View style={{ flexDirection: "row" }}>
            {/* {this.renderBackButton()} */}
            {this.renderAddressBar()}
          </View>
          {this.renderStatusBar()}
        </View>
        <WebView
          ref={WEBVIEW_REF}
          automaticallyAdjustContentInsets={false}
          style={styles.webView}
          source={{ uri: this.state.url }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          startInLoadingState={true}
          scalesPageToFit={this.state.scalesPageToFit}
          onLoad={() => this.refs[WEBVIEW_REF].postMessage(this.state.cookie)}
          {...(this.state.jsCode
            ? { injectedJavaScript: this.state.jsCode }
            : {})}
          {...this.props.webviewProps}
          onLoadEnd={() => this.setState({ refreshing: false })}
        />
        {this.renderToolbar()}
      </ScrollView>
    );
  }

  goBack() {
    this.refs[WEBVIEW_REF].goBack();
  }

  goForward() {
    this.refs[WEBVIEW_REF].goForward();
  }

  goHome() {
    this.load(this.props.url);
  }

  load(url) {
    this.setState({
      url
    });
  }

  reload() {
    this.refs[WEBVIEW_REF].reload();
  }

  stop() {
    this.refs[WEBVIEW_REF].stopLoading();
  }

  refresh = () => {
    this.setState({ refreshing: true });
    this.refs[WEBVIEW_REF].reload();
  };

  onShouldStartLoadWithRequest(event) {
    return this.props.onShouldStartLoadWithRequest(event);
  }

  onNavigationStateChange(navState) {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      currentUrl: navState.url,
      status: navState.title,
      loading: navState.loading,
      scalesPageToFit: true
    });

    this.props.onNavigationStateChange(navState);
  }
}

Webbrowser.propTypes = propTypes;
Webbrowser.defaultProps = defaultProps;

export default Webbrowser;
