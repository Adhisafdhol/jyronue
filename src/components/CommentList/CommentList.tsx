import React, { FC, useEffect, useState } from "react";
import styles from "./CommentList.module.css";
import { Link, useParams } from "react-router-dom";
import { unescapeInput } from "../../utils/htmlDecoder";
import ReplyList from "../ReplyList/ReplyList";
import LikeButton from "../LikeButton/LikeButton";
import CommentBox from "../CommentBox/CommentBox";
import { CommentValue } from "../../config/typeValues";

interface Props {
  commentInputRef: React.MutableRefObject<null | HTMLInputElement>;
}

const CommentList: FC<Props> = ({ commentInputRef }) => {
  const { postid } = useParams();
  const [comments, setComments] = useState<CommentValue[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/post/${postid}/comments?limit=100`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const resData = await res.json();

        if (resData.error) {
          console.log(resData.error);
        } else {
          console.log(resData);
          setComments(resData.comments);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchComments();
  }, [postid]);

  const updateLikesBox = ({
    likesBox,
    userLikeStatus,
  }: {
    likesBox: {
      id: string;
      _count: {
        likes: number;
      };
    };
    userLikeStatus: boolean;
  }) => {
    if (comments) {
      const selectedComment = comments.find(
        (comment) => comment.likesBox.id === likesBox.id
      );
      const changedComment = { ...selectedComment, likesBox, userLikeStatus };
      const updatedComment = comments.map((comment) => {
        return comment.id === changedComment.id ? changedComment : comment;
      }) as CommentValue[];

      setComments([...updatedComment]);
    }
  };

  const updateComments = ({ comment }: { comment: CommentValue }) => {
    setComments([comment, ...comments]);
    console.log(comments);
  };

  return (
    <ul className={styles.comments}>
      <CommentBox
        updateComments={updateComments}
        commentInputRef={commentInputRef}
      />
      <p className={styles.commentHeading}>Comments</p>
      <div className={styles.commentList}>
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            return (
              <li className={styles.comment} key={comment.id}>
                <Link to={`/profile/${comment.author.username}`}>
                  <img
                    className={styles.commentUserProfile}
                    src={comment.author.profileImage.pictureUrl}
                  ></img>
                </Link>

                <div className={styles.mainComment}>
                  <div className={styles.commentProfileInfo}>
                    <Link
                      to={`/profile/${comment.author.username}`}
                      className={styles.commentDisplayName}
                    >
                      {comment.author.displayName}
                    </Link>

                    <Link
                      to={`/profile/${comment.author.username}`}
                      className={styles.commentUsername}
                    >
                      {`@${comment.author.username}`}
                    </Link>
                  </div>
                  <p className={styles.commentText}>
                    {unescapeInput(comment.content)}
                  </p>
                  <div className={styles.interactionInfo}>
                    <div className={styles.interactionButtons}>
                      <LikeButton
                        id={comment.id}
                        type="comment"
                        likesBox={comment.likesBox}
                        likesBoxId={comment.likesBox.id}
                        updateLikesBox={updateLikesBox}
                        size="SMALL"
                        userLikeStatus={comment.userLikeStatus}
                      />
                      <button className={styles.reply}></button>
                    </div>
                  </div>
                  {comment.likesBox._count.likes > 0 && (
                    <p className={styles.likeCountText}>
                      <span> {comment.likesBox._count.likes}</span>{" "}
                      {comment.likesBox._count.likes < 2 ? "like" : "likes"}
                    </p>
                  )}

                  {comment._count.replies > 0 && (
                    <ReplyList
                      commentId={comment.id}
                      replyCount={comment._count.replies}
                    />
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li className={styles.comment}>
            <p className={styles.commentText}>No comments yet</p>
          </li>
        )}
      </div>
    </ul>
  );
};

export default CommentList;
