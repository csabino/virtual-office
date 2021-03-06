import React from "react";
import { Theme, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { debounce, sortBy } from "lodash";

import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";
import ParticipantAvatar from "./ParticipantAvatar";
import ParticipantsList from "./ParticipantsList";
import Dialog from "./Dialog";
import { participantMatches } from "../search";

const ANONYMOUS_PARTICIPANTS = (import.meta as any).env.SNOWPACK_PUBLIC_ANONYMOUS_PARTICIPANTS === "true";
const useStyles = makeStyles<Theme>((theme) => ({
  avatarGroup: {
    marginLeft: 8,
    cursor: "pointer",
  },
  anonymousParticipantsText: {
    fontWeight: 600,
  },
  emptyGroup: {
    color: theme.palette.grey.A200,
  },
  userParticipant: {
    height: 44,
    display: "flex",
    alignItems: "center",
  },
  anonymousParticipant: {
    height: 44,
  },
}));

interface Props {
  name: string;
  participants: MeetingParticipant[];
  showParticipants: boolean;
  setShowParticipants: (open: boolean) => void;
}

const RoomParticipants = (props: Props) => {
  const [participantSearch, setParticipantSearch] = React.useState("");

  function handleSearch(searchText: string) {
    setParticipantSearch(searchText.toLowerCase());
  }

  function openDialog(open: boolean) {
    setParticipantSearch("");
    props.setShowParticipants(open);
  }

  const classes = useStyles();

  if (props.participants.length <= 0) {
    return (
      <div className={classes.userParticipant}>
        <Typography className={classes.emptyGroup} variant="body2">
          No one is here
        </Typography>
      </div>
    );
  }

  if (ANONYMOUS_PARTICIPANTS) {
    return (
      <div className={classes.anonymousParticipant}>
        <Typography variant="body2" className={classes.anonymousParticipantsText}>
          {props.participants.length} participant{props.participants.length > 1 ? "s" : ""}
        </Typography>
      </div>
    );
  }

  const sortedParticipants = sortBy(props.participants, (participant) => participant.username);
  const filteredParticipants = sortedParticipants.filter((participant) =>
    participantMatches(participantSearch, participant)
  );

  return (
    <div>
      <AvatarGroup className={classes.avatarGroup} max={5} onClick={() => props.setShowParticipants(true)}>
        {sortedParticipants.map((participant, index) => (
          <ParticipantAvatar
            key={participant.id}
            participant={participant}
            zIndex={sortedParticipants.length - index}
          />
        ))}
      </AvatarGroup>

      <Dialog
        open={props.showParticipants}
        setOpen={openDialog}
        title={props.name}
        variant="big"
        handleOk={() => props.setShowParticipants(false)}
        handleSearch={debounce(handleSearch, 200)}
      >
        <ParticipantsList participants={filteredParticipants} />
      </Dialog>
    </div>
  );
};

export default RoomParticipants;
