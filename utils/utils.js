const _ = require('lodash');

const formatContactResponse = (contact) => {
  const plainContact = contact.toObject ? contact.toObject() : contact;
  const response = _.omit(plainContact, ['image']);
  response.imagehref = {
    method: "get",
    uri: `/api/contact/${contact._id}/image`
  };
  return response;
};

module.exports = {
  formatContactResponse
};
