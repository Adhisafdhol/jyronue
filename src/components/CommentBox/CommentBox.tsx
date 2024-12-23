import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./CommentBox.module.css";
import { CommentFormValue } from "../../config/formValues";
import { useParams } from "react-router-dom";
import { FC, useState } from "react";
import { CommentValue } from "../../config/typeValues";
import Loader from "../Loader/Loader";
const domain = import.meta.env.VITE_DOMAIN;

interface Props {
  updateComments: ({ comment }: { comment: CommentValue }) => void;
  commentInputRef: React.MutableRefObject<null | HTMLInputElement>;
}

const CommentBox: FC<Props> = ({ updateComments, commentInputRef }) => {
  const params = useParams();
  const postId = params.postid;
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CommentFormValue>();
  const { ref, ...rest } = register("content", {
    required: "Comment is required",
    validate: (value) => {
      const regex = new RegExp(/\s/, "g");
      const filteredValue = value.replace(regex, "");
      return filteredValue.length > 0
        ? true
        : "Comment cannot only contain white-space characters";
    },
  });
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<CommentFormValue> = async (data) => {
    const formData = new URLSearchParams();
    formData.append("content", data.content);

    setIsSubmitting(true);
    setInput("");
    try {
      const comment = await fetch(`${domain}/post/${postId}/comment`, {
        mode: "cors",
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const commentData = await comment.json();

      if (commentData.error) {
        console.log(`${commentData.error.message}: Comment box`);

        // Handle validation error
        if (commentData.error.errors) {
          const errorList = commentData.error.errors;

          errorList.forEach(
            (error: { field: string; value: string; msg: string }) =>
              console.log(error.msg)
          );
        }
      } else {
        console.log(`${commentData.message}`);
        updateComments({ comment: commentData.comment });
      }
    } catch (err) {
      console.log("Something went wrong !: Comment box");
      if (err instanceof TypeError) console.log(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.commentBox}>
      <form
        className={styles.commentBoxForm}
        method="post"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.inputContainer}>
          <label
            className={styles.hidden}
            htmlFor="comment"
            aria-label="Comment to post"
          >
            Comment
          </label>
          {errors && errors.content && (
            <div className={styles.errorText}>{errors.content.message}</div>
          )}
          <input
            className={styles.commentInput}
            id="comment"
            placeholder="Write a comment"
            value={input}
            onInput={(e) => {
              const current = e.target as HTMLInputElement;
              setInput(current.value);
            }}
            ref={(e) => {
              ref(e);
              commentInputRef.current = e;
            }}
            autoComplete="off"
            {...rest}
          ></input>
        </div>
        {isSubmitting ? (
          <div>
            <Loader
              type="spinner"
              size={{ width: "1.5em", height: "1.5em" }}
              color="var(--accent-color-1)"
            />
          </div>
        ) : (
          <button
            className={styles.commentButton}
            aria-label="Reply to the post"
          ></button>
        )}
      </form>
    </div>
  );
};

export default CommentBox;
