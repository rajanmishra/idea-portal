'use strict';

module.exports = {

  STATUSES: Object.freeze({
    ACTIVE: 1, // is still active
    INACTIVE: 2, // not active
    PENDING: 3, //  approval pending
    APPROVE: 4, // approved
    DISAPPROVE: 5, // disapproved
    PROGRESS: 6, // work in progess
  }),

  VOTES: Object.freeze({
    UPVOTE: 1, // upvote
    DOWNVOTE: 2, // downvote
    SPONSOR: 3, //  sponsorship vote
  }),

};
