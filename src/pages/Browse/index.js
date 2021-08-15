import React, { Component } from "react";

import { CircularProgress } from "@material-ui/core";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import axios from "axios";

import { Carousel, Footer, Nav, theme } from "../../components";

export default class Browse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth:
        window.sessionStorage.getItem("auth") ||
        window.localStorage.getItem("auth") ||
        "0",
      isLoaded: false,
      metadata: {},
      server:
        window.sessionStorage.getItem("server") ||
        window.localStorage.getItem("server") ||
        window.location.origin,
      starred_lists: JSON.parse(
        window.localStorage.getItem("starred_lists") || "[]"
      ),
      ui_config: JSON.parse(
        window.localStorage.getItem("ui_config") ||
          window.sessionStorage.getItem("ui_config") ||
          "{}"
      ),
    };
  }

  componentDidMount() {
    let { auth, server, starred_lists, ui_config } = this.state;

    if (!auth || !server) {
      this.props.history.push("/logout");
    }

    let req_path = `${server}/api/v1/metadata`;
    let req_args = `?a=${auth}&r=0:${
      ui_config.range || "16"
    }&s=popularity-des&rmdup=true`;

    axios
      .get(req_path + req_args)
      .then((response) => {
        let metadata = response.data.content;
        for (let i = starred_lists.length - 1; i >= 0; i--) {
          if (starred_lists[i].categoryInfo.pinned) {
            metadata.unshift(starred_lists[i]);
          }
        }
        this.setState({
          isLoaded: true,
          metadata: metadata,
        });
      })
      .catch((error) => {
        console.error(error);
        if (error.response) {
          let data = error.response.data;
          if (data.code === 401) {
            Swal.fire({
              title: "Error!",
              text: data.message,
              icon: "error",
              confirmButtonText: "Login",
              confirmButtonColor: theme.palette.success.main,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              }
            });
          } else if (!server) {
            this.props.history.push("/logout");
          } else {
            Swal.fire({
              title: "Error!",
              text: data.message,
              icon: "error",
              confirmButtonText: "Logout",
              confirmButtonColor: theme.palette.success.main,
              cancelButtonText: "Retry",
              cancelButtonColor: theme.palette.error.main,
              showCancelButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              } else if (result.isDismissed) {
                location.reload();
              }
            });
          }
        } else if (error.request) {
          if (!server) {
            this.props.history.push("/logout");
          } else {
            Swal.fire({
              title: "Error!",
              text: `Flixverse could not communicate with the server! Is '${server}' the correct address?`,
              icon: "error",
              confirmButtonText: "Logout",
              confirmButtonColor: theme.palette.success.main,
              cancelButtonText: "Retry",
              cancelButtonColor: theme.palette.error.main,
              showCancelButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              } else if (result.isDismissed) {
                location.reload();
              }
            });
          }
        }
      });
  }

  componentDidUpdate() {
    if (this.state.isLoaded) {
      var urls = document
        .getElementById(
          Buffer.from("Zm9vdGVyX19jb250YWluZXI=", "base64").toString()
        )
        .getElementsByTagName("a");
      if (
        urls[0].href !=
          Buffer.from(
            "aHR0cHM6Ly93d3cudGVsZWdyYW0uZG9nL0ZsaXh2ZXJzZQ==",
            "base64"
          ).toString() ||
        urls[1].href !=
          Buffer.from("aHR0cHM6Ly9naXRodWIuY29tL2xpYkRyaXZlL2xpYkRyaXZlLw==", "base64").toString() ||
        !urls[1].innerHTML.includes(
          Buffer.from("RWxpYXMgQmVuYm91cmVuYW5l", "base64").toString()
        )
      ) {
        console.error(
          "Something very wrong happened!\n\nIf you are seeing this message, contact libDrive support at:\nhttps://t.me/libdrive-support"
        );
        this.setState({ isLoaded: false });
      }
    }
  }

  render() {
    let { isLoaded, metadata } = this.state;

    return isLoaded ? (
      <div className="Browse">
        <Nav {...this.props} />
        <Carousel metadata={metadata} />
        <Footer />
      </div>
    ) : (
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
