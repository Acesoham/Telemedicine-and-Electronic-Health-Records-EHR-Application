const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sohamgaikwad2002:soham@cluster0.db6t2.mongodb.net/medivault?retryWrites=true&w=majority').then(async () => {
  try {
    const db = mongoose.connection.db;
    const docs = await db.collection('recordings').find({}).limit(5).toArray();
    for (const doc of docs) {
      const data = doc.recordingDataUrl ? doc.recordingDataUrl.substring(0, 100) : 'none';
      console.log(`ID: ${doc._id}, Size: ${doc.fileSize}, Mime: ${doc.mimeType}, Header: ${data}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
