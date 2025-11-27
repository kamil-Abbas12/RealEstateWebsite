import clientPromise from '../../../lib/mongodb.js'
import {ObjectId} from 'mongodb'
import { getServerSession } from 'next-auth'
import {authOptions} from '../auth/[...nextauth].js'
import Success from '@/pages/sucess.js'

export default async function handler(req,res){
if(req.method !== "DELETE"){
return  res.status(405).json({message:"Method not allowed!"})

}

try{
  const session = await getServerSession(req,res,authOptions)
  if(!session ) return res.status(401).json({message:"Unauthorized!"})

const {id} = req.query;
if(!id) return res.status(400).json({message:"Property ID required"})

  const client = await clientPromise;;
  const db = client.db("realestate")

  // Delete only user own property
  const result = await db.collection("properties").deleteOne({
    _id: new ObjectId(id),
    userId : session.user.email,
  })
if(result.deletedCount === 0){
  return res.status(404).json({message:"Property not found!"})
}
res.status(200).json({success:true, message:"Property deleted Successfully!"})
}catch(err){
  // console.error(err)
  res.status(500).json({message:"Server Error!"})
}
}