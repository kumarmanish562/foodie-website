import mongoose from "mongoose";

export const connectDB = async() => {
  await mongoose.connect('mongodb+srv://ailogintools:m&mmeals562@cluster0.rtsur9f.mongodb.net/m&mmeals')
  .then(() => console.log('DB CONNECTED'))
}