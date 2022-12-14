import React, { useContext } from "react";
import { ChatDataContext } from "context/ChatDataProvider";
import { useNavigate } from "react-router-dom";

//components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

//styles
import styles from "assets/jss/headerStyle";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(styles);

export default function Header(props) {
  const classes = useStyles();
  const chatData = useContext(ChatDataContext);
  const { leaveChat, status } = chatData;
  const navigate = useNavigate();

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" classes={{ root: classes.appBar }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CommonTongue
            </Typography>
            <Button
              color="inherit"
              onClick={() => {
                if (status !== "waiting") {
                  leaveChat();
                }
                navigate("/logout");
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      {props.children}
    </div>
  );
}
