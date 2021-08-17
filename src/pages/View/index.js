import React, { Component } from "react";

import { CircularProgress } from "@material-ui/core";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import axios from "axios";
import queryString from "query-string";

import { Footer, guid, Nav, seo, theme } from "../../components";
import MovieView from "./MovieView";
import { TVBView, TVSView } from "./TVView";
import "./index.css";

export default class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth:
        window.sessionStorage.getItem("auth") ||
        window.localStorage.getItem("auth") ||
        "0",
      id: this.props.match.params.id,
      isAndroid: /(android)/i.test(
        navigator.userAgent || navigator.vendor || window.opera
      ),
      isIOS:
        /iPad|iPhone|iPod/.test(
          navigator.userAgent || navigator.vendor || window.opera
        ) && !window.MSStream,
      isLoaded: false,
      metadata: {},
      openStarDialog: false,
      playerKey: guid(),
      q:
        queryString.parse(this.props.location.search).q ||
        JSON.parse(window.localStorage.getItem("watching") || "{}")[
          this.props.match.params.id
        ] ||
        0,
      server:
        window.sessionStorage.getItem("server") ||
        window.localStorage.getItem("server") ||
        window.location.origin,
      sources: [],
      starred:
        JSON.parse(window.localStorage.getItem("starred_lists") || "[]").some(
          (i) => i.children.some((x) => x.id == this.props.match.params.id)
        ) || false,
      subtitle: { url: "" },
      ui_config: JSON.parse(
        window.localStorage.getItem("ui_config") ||
          window.sessionStorage.getItem("ui_config") ||
          "{}"
      ),
      watching: JSON.parse(window.localStorage.getItem("watching") || "{}"),
    };
  }

  async componentDidMount() {
    let { auth, id, q, server } = this.state;
    q = parseInt(q);

    if (!auth || !server) {
      this.props.history.push("/logout");
    }

    document.documentElement.style.setProperty(
      "--plyr-color-main",
      theme.palette.primary.main
    );
    document.documentElement.style.setProperty(
      "--plyr-video-background",
      theme.palette.background.default
    );
    document.documentElement.style.setProperty(
      "--plyr-menu-background",
      theme.palette.background.paper
    );
    document.documentElement.style.setProperty(
      "--plyr-menu-color",
      theme.palette.text.primary
    );

    let req_path = `${server}/api/v1/metadata`;
    let req_args = `?a=${auth}&id=${encodeURIComponent(id)}`;

    var response1 = await axios.get(req_path + req_args).catch((error) => {
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
            text: `Something went wrong while communicating with the server! Is '${server}' the correct address?`,
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
            text: `Chikiyaflix could not communicate with the server! Is '${server}' the correct address?`,
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

    let name;
    let new_id;
    let metadata = response1.data.content;
    if (metadata.type == "directory" && metadata.children.length) {
      if (metadata.children[q].type == "file") {
        new_id = metadata.children[q].id;
        name = metadata.children[q].name;
      } else {
        name = metadata.name;
      }
    } else {
      name = metadata.name;
      new_id = id;
    }

    var response2;
    if (new_id) {
      let req_path = `${server}/api/v1/streammap`;
      let req_args = `?a=${auth}&id=${encodeURIComponent(
        new_id
      )}&name=${encodeURIComponent(name)}&server=${encodeURIComponent(server)}`;

      response2 = await axios.get(req_path + req_args).catch((error) => {
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
              text: `Something went wrong while communicating with the server! Is '${server}' the correct address?`,
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
              text: `Chikiyaflix could not communicate with the server! Is '${server}' the correct address?`,
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
    } else {
      response2 = {
        data: { content: { default_quality: 0, sources: [], subtitles: [] } },
      };
    }
    this.setState({
      default_quality: response2.data.content.default_quality,
      isLoaded: true,
      metadata: response1.data.content,
      name: name,
      q: q,
      sources: response2.data.content.sources,
      subtitle: response2.data.content.subtitle,
    });
  }

  componentWillUnmount() {
    seo();
  }

  render() {
    let { isLoaded, metadata, ui_config } = this.state;

    if (isLoaded) {
      seo({
        title: metadata.title
          ? `${ui_config.title || "Chikiyaflix"} - ${metadata.title}`
          : ui_config.title || "Chikiyaflix",
        description: `Watch ${metadata.title || metadata.name} on ${
          ui_config.title || "Chikiyaflix"
        }!`,
        image: metadata.backdropPath,
      });
    }

    return isLoaded && metadata.type == "file" ? (
      <div className="View">
        <Nav {...this.props} />
        <MovieView state={this.state} />
        <Footer />
      </div>
    ) : isLoaded && metadata.type == "directory" && metadata.title ? (
      <div className="View">
        <Nav {...this.props} />
        <TVBView state={this.state} />
        <Footer />
      </div>
    ) : isLoaded && metadata.type == "directory" ? (
      <div className="View">
        <Nav {...this.props} />
        <TVSView state={this.state} />
        <Footer />
      </div>
    ) : (
      <div className="Loading">
        <CircularProgress />
      </div>
    );
  }
}
