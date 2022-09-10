import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { ChatDataContext } from "context/ChatDataProvider";
import { toast } from "react-toastify";
import { isBlank } from "helpers";
import { translationService } from "services/translation.service";

//mui components
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import FilledInput from "@mui/material/FilledInput";

//icons
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SendIcon from "@mui/icons-material/Send";
import CircleIcon from "@mui/icons-material/Circle";

//styles
import styles from "assets/jss/dashboardStyle";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const chatData = useContext(ChatDataContext);
  const [message, setMessage] = useState("");
  const [languageOptions, setLanguageOptions] = useState(null);
  const scrollRef = useRef();
  const classes = useStyles();
  const { language, setLanguage, leaveChat, status } = chatData;
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleUnmount = useCallback(function() {
    if (status !== "waiting") {
      leaveChat();
      setMessage("");
    }
  },[status, leaveChat]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnmount, false);
    return () => {
      window.removeEventListener("beforeunload", handleUnmount, false);
    };
  }, [handleUnmount]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView();
    }
  }, [chatData.messages]);

  const beginChatting = () => {
    chatData.initiateConnection(language);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    chatData.sendMessage(message);
    setMessage("");
  };

  const fetchOptions = async () => {
    try {
      const result = await translationService.fetchLanguages();
      const languages = result.data.translation;
      delete languages["en"];
      const formatted = Object.keys(languages).map((code) => {
        return (
          <MenuItem key={code} value={code}>
            {languages[code].nativeName}
          </MenuItem>
        );
      });
      setLanguageOptions(formatted);
      return formatted;
    } catch (e) {
      console.warn("Failed to fetch languages", e);
      toast.error("Failed to fetch supported languages.");
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const selectionPage = () => {
    return (
      <Grid item xs={12} className={classes.card}>
        <Grid container flexDirection="column">
          <Grid item>
            <h3 className={classes.instruction}>
              Select your language to begin chatting
            </h3>
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={handleLanguageChange}
              >
                <MenuItem value={"en"}>English</MenuItem>
                {languageOptions?.map((languageItem) => languageItem)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={beginChatting}
              className={classes.button}
            >
              Begin
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const loadingPage = () => {
    return (
      <Fragment>
        <p>Connecting you to someone special...</p>
        <Grid item>
          <CircularProgress className={classes.loader} />
        </Grid>
        <Grid item>
          <Button onClick={chatData.leaveChat}>Cancel</Button>
        </Grid>
      </Fragment>
    );
  };

  const chatPage = () => {
    return (
      <Grid item xs={12} className={classes.card}>
        <Grid container className={classes.chatBox}>
          <Grid item xs={12} className={classes.titleItem}>
            <CircleIcon className={classes.circleIcon} />
            <span className={classes.chatTitle}>
              {`Connected with ${chatData.partnerRef.current?.name}`}
            </span>
            <Tooltip title="Leave chat">
              <IconButton onClick={chatData.leaveChat}>
                <ExitToAppIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} className={classes.messageBox}>
            <Grid container flexDirection="column">
              {chatData.messages.length > 0
                ? chatData.messages.map((message, index) => {
                    return (
                      <Grid
                        item
                        key={index}
                        alignSelf={
                          message.author === "partner"
                            ? "flex-start"
                            : "flex-end"
                        }
                      >
                        <Tooltip title={message.original || ""}>
                          <div
                            className={
                              message.author === "partner"
                                ? classes.partnerMessage
                                : classes.selfMessage
                            }
                          >
                            <span>{message.content}</span>
                          </div>
                        </Tooltip>
                      </Grid>
                    );
                  })
                : "Start chatting!"}
            </Grid>
            <div ref={scrollRef} />
          </Grid>
          <Grid item xs={12}>
            <FilledInput
              value={message}
              onChange={handleMessageChange}
              fullWidth
              disableUnderline
              size="small"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isBlank(message)) {
                  sendMessage();
                }
              }}
              inputProps={{ maxLength: 500 }}
              className={classes.inputField}
              placeholder="Type in message..."
              endAdornment={
                <InputAdornment position="end" className={classes.adornment}>
                  <IconButton
                    disabled={isBlank(message)}
                    aria-label="send message"
                    onClick={sendMessage}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const getPage = () => {
    switch (status) {
      case "waiting":
        return selectionPage();
      case "enqueued":
        return loadingPage();
      case "connected":
        return chatPage();
      default:
        return;
    }
  };

  return (
    <Fragment>
      <Grid
        container
        className={classes.background}
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        {getPage()}
      </Grid>
    </Fragment>
  );
}
