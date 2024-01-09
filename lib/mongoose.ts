import console from 'console';
import mongoose from 'mongoose';
import { Question } from '../database/question.model';

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set('strictQuery', true)

  if (!process.env.MONGODB_URL) {
    return console.log('MISSING MONGODB_URL')
  }

  if (isConnected) {
    console.log('MONGODB is already connected')
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'devflow'
    })

    const question = new Question({
      title: 'Teste',
      explanation: 'Teste explanation from question',
      tags: ['Teste', 'Mongol', 'DB']
    })

    await question.save()

    isConnected = true
    console.log('MongoDb is connected')
  } catch (error) {
    console.log(error)
  }
}