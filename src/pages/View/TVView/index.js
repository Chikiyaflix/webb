import React, { Component } from "react";

import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  Chip,
  ClickAwayListener,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import YouTubeIcon from "@material-ui/icons/YouTube";

import DPlayer from "react-dplayer";
import VTTConverter from "srt-webvtt";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import axios from "axios";

import {
  ChildrenMenu,
  DownloadMenu,
  guid,
  PlayerMenu,
  PlaylistMenu,
  seo,
  StarDialog,
  theme,
  TrailerDialog,
} from "../../../components";

export class TVBView extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props.state, tooltipOpen: false, trailer: {} };
    this.prettyDate = this.prettyDate.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.handleStarClose = this.handleStarClose.bind(this);
    this.handleTrailer = this.handleTrailer.bind(this);
    this.handleTrailerClose = this.handleTrailerClose.bind(this);
  }

  componentDidMount() {
    let { metadata, ui_config } = this.state;

    seo({
      title: `${ui_config.title || "Chikiyaflix"} - ${
        metadata.title || metadata.name
      }`,
      description: `Watch ${metadata.title || metadata.name} on ${
        ui_config.title || "Chikiyaflix"
      }! — ${metadata.overview}`,
      image: metadata.backdropPath,
      type: "video.movie",
    });
  }

  prettyDate() {
    let old_date = this.state.metadata.releaseDate;
    let date_comp = old_date.split("-");
    let date = new Date(date_comp[0], date_comp[1], date_comp[2]);
    return date.toDateString();
  }

  handleStar() {
    this.setState({ openStarDialog: true });
  }

  handleStarClose(evt) {
    if (evt == "starred") {
      this.setState({ openStarDialog: false, starred: true });
    } else if (evt == "unstarred") {
      this.setState({
        openStarDialog: false,
        starred:
          JSON.parse(window.localStorage.getItem("starred_lists") || "[]").some(
            (i) => i.children.some((x) => x.id == this.state.metadata.id)
          ) || false,
      });
    } else {
      this.setState({ openStarDialog: false });
    }
  }

  handleTrailer() {
    let { auth, metadata, server, trailer } = this.state;

    if (!trailer.key) {
      let req_path = `${server}/api/v1/trailer/${metadata.apiId}`;
      let req_args = `?a=${auth}&t=tv&api=${metadata.api}`;

      axios
        .get(req_path + req_args)
        .then((response) =>
          this.setState({
            openTrailerDialog: true,
            trailer: response.data.content,
          })
        )
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
                text: "No trailer could be found.",
                icon: "error",
                confirmButtonText: "Ok",
                confirmButtonColor: theme.palette.success.main,
              });
            }
          } else if (error.request) {
            if (!server) {
              this.props.history.push("/logout");
            } else {
              Swal.fire({
                title: "Error!",
                text: "Something went wrong while looking for trailers.",
                icon: "error",
                confirmButtonText: "Ok",
                confirmButtonColor: theme.palette.success.main,
              });
            }
          }
        });
    } else {
      this.setState({ openTrailerDialog: true });
    }
  }

  handleTrailerClose() {
    this.setState({ openTrailerDialog: false });
  }

  render() {
    let { metadata, server, starred, tooltipOpen, trailer } = this.state;

    return (
      <div className="TVBView">
        <div className="info__container">
          <div className="info__left">
            <img
              className="info__poster"
              src={
                metadata.posterPath ||
                `${server}/api/v1/image/poster?text=${metadata.title}&extention=jpeg`
              }
            />
            <img
              className="info__backdrop"
              src={
                metadata.backdropPath ||
                `${server}/api/v1/image/backdrop?text=${metadata.title}&extention=jpeg`
              }
            />
          </div>
          <div className="info__right">
            <ClickAwayListener
              onClickAway={() => this.setState({ tooltipOpen: false })}
            >
              <Tooltip
                title={
                  <Typography variant="subtitle2">{metadata.name}</Typography>
                }
                arrow
                placement="bottom-start"
                open={tooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                onClose={() => this.setState({ tooltipOpen: false })}
                PopperProps={{
                  disablePortal: true,
                }}
              >
                <Typography
                  onClick={() => this.setState({ tooltipOpen: true })}
                  variant="h3"
                  style={{ fontWeight: "bold" }}
                  className="info__title"
                >
                  {metadata.title}
                </Typography>
              </Tooltip>
            </ClickAwayListener>
            <Typography
              variant="body1"
              className="info__overview"
              style={{ marginTop: "30px" }}
            >
              {metadata.overview}
            </Typography>
            <div className="vote__container">
              <Rating
                name="Rating"
                value={metadata.voteAverage}
                max={10}
                readOnly
              />
            </div>
            <div className="info__release">
              <IconButton onClick={this.handleStar}>
                {starred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
              <Typography
                style={{ display: "flex", alignItems: "center" }}
                variant="body2"
              >
                {metadata.language
                  ? `${this.prettyDate()} (${metadata.language.toUpperCase()})`
                  : this.prettyDate()}
              </Typography>
            </div>
            <div className="info__buttons2">
              <ChildrenMenu state={this.state} />
              <div className="info__button2">
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ width: "140px" }}
                  onClick={this.handleTrailer}
                  startIcon={<YouTubeIcon />}
                >
                  Trailer
                </Button>
              </div>
            </div>
            <div className="info__genres">
              {metadata.genres && metadata.genres.length
                ? metadata.genres.map((genre) => (
                    <Link
                      to={`/genres?genre=${genre}`}
                      className="no_decoration_link"
                      key={guid()}
                    >
                      <Chip
                        avatar={<Avatar>{genre.charAt(0)}</Avatar>}
                        className="info__genre"
                        label={genre}
                        variant="outlined"
                      />
                    </Link>
                  ))
                : null}
            </div>
          </div>
        </div>
        <StarDialog
          isOpen={this.state.openStarDialog}
          handleClose={this.handleStarClose}
          metadata={metadata}
        />
        <TrailerDialog
          isOpen={this.state.openTrailerDialog}
          handleClose={this.handleTrailerClose}
          metadata={metadata}
          trailer={trailer}
        />
      </div>
    );
  }
}

export class TVSView extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props.state, subtitleMenuAnchor: false };
    this.onFileChange = this.onFileChange.bind(this);
    this.handleSubtitleMenuOpen = this.handleSubtitleMenuOpen.bind(this);
    this.handleSubtitleMenuClose = this.handleSubtitleMenuClose.bind(this);
  }

  componentDidMount() {
    let { metadata, q, ui_config } = this.state;

    seo({
      title: `${ui_config.title || "Chikiyaflix"} - ${metadata.children[q].name}`,
      description: `Watch ${metadata.children[q].name} on ${
        ui_config.title || "Chikiyaflix"
      }!`,
      type: "video.episode",
    });
  }

  componentWillUnmount() {
    let { id, q, watching } = this.state;

    watching[id] = q;

    window.localStorage.setItem("watching", JSON.stringify(watching));
  }

  async onFileChange(evt) {
    if (evt.target.files.length) {
      if (evt.target.files[0].name.endsWith(".srt")) {
        const vtt = new VTTConverter(evt.target.files[0]);
        let res = await vtt.getURL();
        this.setState({ file: res, playerKey: guid() });
      } else {
        this.setState({
          file: URL.createObjectURL(evt.target.files[0]),
          playerKey: guid(),
        });
      }
    } else {
      this.setState({ file: null, playerKey: guid() });
    }
  }

  handleSubtitleMenuOpen(evt) {
    let { subtitle } = this.state;

    if (subtitle && subtitle.url != "") {
      this.setState({
        subtitleMenuAnchor: evt.currentTarget,
      });
    } else {
      const subtitleButton = document.getElementById("file-input-button");
      subtitleButton.click();
    }
  }

  handleSubtitleMenuClose() {
    this.setState({
      subtitleMenuAnchor: false,
    });
  }

  render() {
    let {
      default_quality,
      file,
      metadata,
      playerKey,
      q,
      server,
      sources,
      subtitle,
      subtitleMenuAnchor,
    } = this.state;

    if (file) {
      subtitle = { url: file };
    }

    function isHash(n, hash) {
      if (n === hash) {
        return "pls-playing";
      } else {
        return "";
      }
    }

    return (
      <div className="TVSView">
        <div className="plyr__component">
          <DPlayer
            key={playerKey}
            style={{
              borderRadius: "12px 12px 0 0",
              borderWidth: "4px 4px 0 4px",
              borderColor: "black",
              borderStyle: "solid",
            }}
            options={{
              video: {
                quality: sources,
                defaultQuality: default_quality,
                pic: `${server}/api/v1/image/thumbnail?id=${metadata.children[q].id}`,
              },
              subtitle: subtitle,
              preload: "auto",
              theme: theme.palette.primary.main,
              contextmenu: [
                {
                  text: "Chikiyaflix",
                  link: "https://telegram.dog/Chikiyaflix",
                },
              ],
              volume: 1,
              lang: "en",
            }}
          />
          <div className="plyr-playlist-wrapper">
            <ul className="plyr-playlist">
              {metadata.children.length
                ? metadata.children.map((child, n) => (
                    <li className={isHash(n, q)} key={n}>
                      <Link
                        to={{
                          pathname: window.location.pathname,
                          search: `?q=${n}`,
                        }}
                        key={guid()}
                      >
                        <img className="plyr-miniposter" />
                        {child.name}
                      </Link>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div
          className="file__info"
          style={{ background: theme.palette.background.paper }}
        >
          <div
            style={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              margin: "30px",
            }}
          >
            <PlayerMenu
              state={{
                ...this.state,
                id: metadata.children[q].id,
                metadata: metadata.children[q],
              }}
            />
            <DownloadMenu state={this.state} tv={true} />
            <PlaylistMenu state={this.state} />
            <div className="info__button">
              <input
                id="file-input"
                hidden
                onChange={this.onFileChange}
                type="file"
                accept=".vtt,.srt"
              />
              <Button
                color="primary"
                variant="outlined"
                style={{ width: "140px" }}
                component="span"
                aria-controls="subtitles-menu"
                startIcon={<SubtitlesOutlinedIcon />}
                onClick={this.handleSubtitleMenuOpen}
              >
                Subtitle
              </Button>
              <Menu
                id="subtitles-menu"
                anchorEl={subtitleMenuAnchor}
                keepMounted
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                open={Boolean(subtitleMenuAnchor)}
                onClose={this.handleSubtitleMenuClose}
              >
                <a className="no_decoration_link" href={subtitle.url}>
                  <MenuItem onClick={this.handleSubtitleMenuClose}>
                    Download
                  </MenuItem>
                </a>
                <MenuItem
                  onClick={() => {
                    document.getElementById("file-input-button").click();
                    this.setState({ subtitleMenuAnchor: false });
                  }}
                >
                  Upload
                </MenuItem>
              </Menu>
              <label htmlFor="file-input" id="file-input-button" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
