import React from "react";
import classes from "./background.css";
const Background = ({ bottomSpace, fixed }) => {
  return (
    <div className={fixed ? classes.Container : null}>
      {bottomSpace > 0 || !bottomSpace ? (
        <div
          className={classes.backgroundGraph}
          style={bottomSpace ? { top: `${0.07 * bottomSpace}vh` } : null}
        />
      ) : null}
      <div className={classes.waveWrapper} style={{ bottom: bottomSpace }}>
        <div className={classes.bgTop}>
          <div className={classes.waveTop} />
        </div>
        <div className={classes.bgMiddle}>
          <div className={classes.waveMiddle} />
        </div>
        <div className={classes.bgBottom}>
          <div className={classes.waveBottom} />
        </div>
      </div>
    </div>
  );
};

export default Background;
