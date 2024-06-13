const express = require('express');
const Jimp = require("jimp");
const multer = require('multer');
const _ = require('lodash');
const {
  createContact,
  deleteContact,
  getAllContacts,
  searchContacts,
  updateContact,
  getContact,
  exportContactsToCSV,
} = require('../services/contactService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/contacts', upload.single('image'), async (req, res) => {
  try {
    const contact = await createContact({ ...req.body, image: req.file?.path });
    const response = _.omit(contact.toObject ? contact.toObject() : contact, ['image']); // Use lodash omit function to exclude 'image' field
    
    response.imagehref = {
      method:"get",
      uri: `/api/contact/${contact._id}/image`
     } 
  
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await deleteContact(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    const response = contacts.map(contact => {
      // Convert to plain object if it's a Mongoose document
      const plainContact = contact.toObject ? contact.toObject() : contact;
      // Omit the 'image' field
      return _.omit(plainContact, ['image']);
    });

    const contactsWithLinks = response.map(contact => {
      contact.imagehref = {
        method:"get",
        uri: `/api/contact/${contact._id}/image`
       } 
       return contact
  });
  
    res.status(200).json(contactsWithLinks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/contacts/search', async (req, res) => {
  try {
    const contacts = await searchContacts(req.query.q);
    const response = contacts.map(contact => {
      // Convert to plain object if it's a Mongoose document
      const plainContact = contact.toObject ? contact.toObject() : contact;
      // Omit the 'image' field
      return _.omit(plainContact, ['image']);
    });

    const contactsWithLinks = response.map(contact => {
      contact.imagehref = {
        method:"get",
        uri: `/api/contact/${contact._id}/image`
       } 
       return contact
  });

    res.status(200).json(contactsWithLinks);
    // res.render('imagepage',{items: contacts.image});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/contacts/:id', upload.single('image'), async (req, res) => {
  try {
    const contact = await updateContact(req.params.id, { ...req.body, image: req.file?.path });
    const response = _.omit(contact.toObject ? contact.toObject() : contact, ['image']); // Use lodash omit function to exclude 'image' field
    
    response.imagehref = {
      method:"get",
      uri: `/api/contact/${contact._id}/image`
     } 
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/contacts/export/csv', async (req, res) => {
  try {
    const csvPath = await exportContactsToCSV('uploads');
    res.download(csvPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.get('/contact/:id/image', async (req, res) => {

    try {

        const contact = await getContact(req.params.id)
        const data = contact.image.data
        res.setHeader('content-type', 'image/png');
        res.send(data);
        } catch (error) {
        
    }

})

module.exports = router;
