"use server"

import Question from "@/database/question.model";
import User from "@/database/user.model";
import console from "console";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, UpdateUserParams } from "./shared.types";

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

// export async function getAllUsers(params: GetAllUsersParams) {
//   try {
//     connectToDatabase()
//   } catch (error) {
//     console.log(error)
//     throw error
//   }
// }