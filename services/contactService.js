const Contact = require('../models/contact');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');





const createContact = async (data) => {
  const { name, phoneNumbers, image } = data;

  // Check if the phone number already exists
  const existingContact = await Contact.findOne({ phoneNumbers: { $in: phoneNumbers } });
  if (existingContact) {
    throw new Error('Number Exists Already');
  }

  const validPhoneNumber = (phoneNumber) => /^[0-9]+$/.test(phoneNumber);
  for (const number of phoneNumbers) {
    if (!validPhoneNumber(number)) {
      throw new Error('Phone number must contain only numbers');
    }
  }
  // Check if the contact name already exists
  const existingName = await Contact.findOne({ name });
  if (existingName){
    throw new Error('Contact Name Exists Already');
  }

  // Read and prepare the image for upload
  const imageUpload = {
    data: fs.readFileSync(path.join(__dirname, '..',  image)),
    contentType: 'image/png'
  };

  // Create a new contact instance
  const newContact = new Contact({ name, phoneNumbers, image: imageUpload });
  const uploadedContact = newContact.save()
  uploadedContact.image = null
  return uploadedContact;
};


const deleteContact = async (contactId) => {
  return Contact.findByIdAndDelete(contactId);
};

const getAllContacts = async () => {
  return Contact.find();
};

const searchContacts = async (query) => {
  return Contact.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { phoneNumbers: { $regex: query, $options: 'i' } },
    ],
  });
};

const updateContact = async (contactId, data) => {

  const { name, phoneNumbers, image } = data;

  try {
    // Check for duplicate phone numbers
    const existingContact = await Contact.findOne({ phoneNumbers: { $in: phoneNumbers } });
    if (existingContact) {
      throw new Error('Number Exists Already');
    }

    const validPhoneNumber = (phoneNumber) => /^[0-9]+$/.test(phoneNumber);
      for (const number of phoneNumbers) {
          if (!validPhoneNumber(number)) {
            throw new Error('Phone number contain only numbers');
        }
    }

    const existingName = await Contact.findOne({ name, _id: { $ne: contactId } });
      if (existingName) {
        throw new Error('Contact Name Exists Already');
    }

    let imageUpload = null;

    if(image !== 'default'){
       imageUpload = {
        data: fs.readFileSync(path.join(__dirname, '..',  image)),
        contentType: 'image/png'
      };
  
    }
    // Construct the update object with $set
    const updateObject = { $set: { name, phoneNumbers } };
    if (imageUpload) {
      updateObject.$set.image = imageUpload;
    }

    // Update the contact
    const updatedContact = await Contact.findByIdAndUpdate(contactId, updateObject, { new: true });

    if (!updatedContact) {
      throw new Error('Contact not found');
    }

    return updatedContact;
  } catch (error) {
    throw new Error(error.message);
  }
};



const getContact = async (contactId) => {
  

  return Contact.findById(contactId);
};


const exportContactsToCSV = async (filePath) => {
  const contacts = await getAllContacts();
  const csvPath = path.join(filePath, 'contacts.csv');

  const csvWriterInstance = csvWriter({
    path: csvPath,
    header: [
      { id: '_id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'phoneNumbers', title: 'Phone Numbers' },
      { id: 'image', title: 'Image' },
    ],
  });

  await csvWriterInstance.writeRecords(contacts);
  return csvPath;
};

module.exports = {
  createContact,
  deleteContact,
  getAllContacts,
  searchContacts,
  updateContact,
  getContact,
  exportContactsToCSV,
};
