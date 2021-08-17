import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";

import { version } from "../../components";

const styles = (theme) => ({
  footer__container: {
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    height: "75px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

class Footer extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div style={{ paddingTop: "75px" }}>
        <footer className={classes.footer__container} id="footer__container">
          <a href="https://www.telegram.dog/chikiyaflix" target="_blank">
            <img
              src="/images/catpc.gif"
              className="footer__github"
              height="64px"
              alt="random-gif"
            />
          </a>
          <a
            className="no_decoration_link footer__text"
            href="https://github.com/libDrive/libDrive/"
            target="_blank"
          >
            {`Chikiyaflix - Elias Benbourenane - v${version}`}
          </a>
        </footer>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Footer);
