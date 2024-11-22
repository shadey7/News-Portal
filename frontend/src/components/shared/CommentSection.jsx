import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { useToast } from "@/hooks/use-toast"
import Comment from "./Comment"

const CommentSection = ({ postId }) => {
  const { toast } = useToast()

  const { currentUser } = useSelector((state) => state.user)
  const [comment, setComment] = useState("")
  const [allComments, setAllComments] = useState([])

  // console.log(allComments)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (comment.length > 200) {
      toast({
        title: "Comment length must be lower than or equal to 200 characters",
      })

      return
    }

    try {
      const res = await fetch("/api/comment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({ title: "Comment successfully!" })
        setComment("")
        setAllComments([data, ...allComments])
      }
    } catch (error) {
      console.log(error)
      toast({ title: "Something went wrong! Please try again." })
    }
  }

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`)

        if (res.ok) {
          const data = await res.json()
          setAllComments(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getComments()
  }, [postId])

  return (
    <div className="max-w-3xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as:</p>

          <img
            src={currentUser.profilePicture}
            alt="Profile Pic"
            className="h-5 w-5 object-cover rounded-full"
          />

          <Link
            to={"/dashboard?tab=profile"}
            className="text-sm text-blue-800 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-gray-700 my-5 flex gap-1">
          You must be signed in to comment.
          <Link to={"/sign-in"} className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {currentUser && (
        <form
          className="border-2 border-gray-400 rounded-md p-4"
          onSubmit={handleSubmit}
        >
          <Textarea
            placeholder="Add a comment..."
            rows="3"
            maxLength="200"
            className="border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />

          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-sm">
              {200 - comment.length} characters remaining
            </p>

            <Button type="submit">Submit</Button>
          </div>
        </form>
      )}

      {allComments.length === 0 ? (
        <p className="text-sm my-5">No comments yes!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1 font-semibold">
            <p>Comments</p>

            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{allComments.length}</p>
            </div>
          </div>

          {allComments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </>
      )}
    </div>
  )
}

export default CommentSection
