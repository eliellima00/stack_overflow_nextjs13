"use server"

import { FilterQuery } from 'mongoose'
import Question from "@/database/question.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, GetSavedQuestionsParams, ToggleSaveQuestionParams, UpdateUserParams } from "./shared.types";
import Tag from '@/database/tag.model';

export async function getUserById(params: any) {
  try {
    connectToDatabase()

    const { userId } = params;

    const user = await User.findOne({
      clerkId: userId
    })

    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase()

    const newUser = await User.create(userData)
    return newUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase()

    const { clerkId, updateData, path } = params

    await User.findOneAndUpdate({
      clerkId
    }, updateData, {
      new: true
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase()

    const { clerkId } = params

    const user = await User.findOneAndDelete({
      clerkId
    })

    if (!user) {
      throw new Error('User not found')
    }

    // delete user from datase 
    // and questions, answersm comments, etc.

    const userQuestionIds = await Question.find({
      author: user.id
    }).distinct('_id')

    await Question.deleteMany({
      author: user.id
    })

    // TODO: Delete all user answers, comments, etc...
    const deletedUser = await User.findByIdAndDelete(user._id);
    return deleteUser;
  } catch (error) {
    console.log(error)
    throw error
  }


}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase()

    //const { page = 1, pageSize = 20, filter, searchQuery } = params
    const users = await User.find({}).sort({
      createdAt: -1
    })

    return {
      users
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase()

    const { userId, questionId, path } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    const isQuestionSaved = user.saved.includes(questionId)

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(userId, {
        $pull: { saved: questionId },
        new: true
      })
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { saved: questionId },
        new: true
      })
    }

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase()

    const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {}

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: '_id clerkId name picture' }
      ]
    })

    if (!user) {
      throw new Error('User Not found')
    }

    const savedQuestions = user.saved

    return { questions: savedQuestions }
  } catch (error) {
    console.log(error)
    throw error
  }
}

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase()
//   } catch (error) {
//     console.log(error)
//     throw error
//   }
// }